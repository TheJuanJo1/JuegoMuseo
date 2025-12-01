import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import path from "path";
import xml2js from "xml2js";
import crypto from "crypto";

const router = Router();
const upload = multer({ dest: "uploads/" });

/*
  Helpers robustos para trabajar con xml2js cuando los prefijos/namespace varían.
  keyFor/get/getNested/asString/asNumber permiten buscar nodos sin depender del prefijo exacto.
*/

function keyFor(obj, target) {
  if (!obj || typeof obj !== "object") return null;
  const keys = Object.keys(obj);
  for (const k of keys) {
    if (k === target) return k;
    if (k.endsWith(`:${target}`)) return k;
    if (k.toLowerCase() === target.toLowerCase()) return k;
    if (k.toLowerCase().endsWith(`:${target.toLowerCase()}`)) return k;
    // también permitir que termine en target (por seguridad)
    if (k.toLowerCase().endsWith(target.toLowerCase())) return k;
  }
  return null;
}

function get(obj, target) {
  const k = keyFor(obj, target);
  return k ? obj[k] : undefined;
}

function getNested(obj, pathArray) {
  let cur = obj;
  for (const p of pathArray) {
    if (!cur) return undefined;
    const k = keyFor(cur, p);
    if (!k) return undefined;
    cur = cur[k];
  }
  return cur;
}

function val(node) {
  if (node === undefined || node === null) return undefined;
  if (typeof node === "object") {
    if ("_" in node) return node._;
    if (typeof node.$ === "object" && Object.keys(node).length === 1) return node.$;
    return node;
  }
  return node;
}

function asString(node) {
  const v = val(node);
  if (v === undefined || v === null) return "";
  if (typeof v === "object") return "";
  return String(v).trim();
}

function asNumber(node) {
  const v = val(node);
  if (v === undefined || v === null) return 0;
  if (typeof v === "object") return 0;
  const n = parseFloat(String(v).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

/* Parsear XML (no eliminamos namespaces) */
const parseXML = async (filePath) => {
  let xmlData = fs.readFileSync(filePath, "utf-8");
  // eliminar BOM si existe
  if (xmlData.charCodeAt(0) === 0xFEFF) xmlData = xmlData.slice(1);
  return await xml2js.parseStringPromise(xmlData, { explicitArray: false });
};

/*
  Calcular CUFE/CUDE (SHA-384) — fórmula basada en UBL/DIAN:
  Cadena: ID + IssueDate + IssueTime + PayableAmount + TaxAmount + NitEmisor + NitReceptor + CLAVE_TECNICA
  -> SHA-384 -> hex uppercase
  Ajusta la cadena si tu esquema DIAN requiere campos distintos.
*/
const calcularCUFE = (doc) => {
  try {
    const id = asString(get(doc, "ID") || get(doc, "InvoiceID") || get(doc, "CreditNoteID"));
    const fecha = asString(get(doc, "IssueDate"));
    const hora = asString(get(doc, "IssueTime")) || "";
    // PayableAmount puede venir en LegalMonetaryTotal.PayableAmount o RequestedMonetaryTotal
    const payableNode =
      getNested(doc, ["LegalMonetaryTotal", "PayableAmount"]) ||
      getNested(doc, ["RequestedMonetaryTotal", "PayableAmount"]);
    const total = asString(payableNode);

    const taxAmountNode = getNested(doc, ["TaxTotal", "TaxAmount"]);
    const impuestos = asString(taxAmountNode) || "0";

    const nitEmisor =
      asString(getNested(doc, ["AccountingSupplierParty", "Party", "PartyTaxScheme", "CompanyID"])) ||
      asString(getNested(doc, ["AccountingSupplierParty", "Party", "PartyIdentification", "ID"])) ||
      "";

    const nitReceptor =
      asString(getNested(doc, ["AccountingCustomerParty", "Party", "PartyTaxScheme", "CompanyID"])) ||
      asString(getNested(doc, ["AccountingCustomerParty", "Party", "PartyIdentification", "ID"])) ||
      "";

    const clave = process.env.CLAVE_TECNICA || "";

    const cadena = `${id}${fecha}${hora}${total}${impuestos}${nitEmisor}${nitReceptor}${clave}`;

    return crypto.createHash("sha384").update(cadena).digest("hex").toUpperCase();
  } catch (e) {
    console.error("Error calculando CUFE:", e);
    return null;
  }
};

/*
  Validar DIAN REAL:
  - campos UBL mínimos
  - existencia de firma/UBLExtensions (exigencia DIAN)
  - cálculo CUFE y comparación con UUID
  Resultado: "Aceptado" | "Rechazado" | "Pendiente"
*/
const validarDIAN = (doc) => {
  try {
    // 1) Validar campos mínimos UBL/DIAN
    const tieneID = !!asString(get(doc, "ID"));
    const tieneFecha = !!asString(get(doc, "IssueDate"));
    const tieneSupplier = !!get(doc, "AccountingSupplierParty");
    const tieneCustomer = !!get(doc, "AccountingCustomerParty");
    const tieneLegal = !!get(doc, "LegalMonetaryTotal");
    const tieneTax = !!get(doc, "TaxTotal") || !!getNested(doc, ["TaxTotal", "TaxAmount"]);

    if (!(tieneID && tieneFecha && tieneSupplier && tieneCustomer && tieneLegal && tieneTax)) {
      return "Rechazado";
    }

    // 2) Revisar firma digital / UBLExtensions (al menos presencia)
    const ublExt = get(doc, "UBLExtensions") || get(doc, "ext:UBLExtensions") || get(doc, "UBLExtensions");
    // firma puede aparecer como ds:Signature o Signature
    const signature =
      getNested(doc, ["UBLExtensions", "UBLExtension", "ExtensionContent", "Signature"]) ||
      get(doc, "Signature") ||
      get(doc, "ds:Signature") ||
      get(doc, "Signature");

    if (!ublExt && !signature) {
      // Documento sin firma — puede considerarse pendiente (si no exige firma en tu flujo),
      // pero DIAN exige firma en muchos casos. Dejamos Pendiente para revisión manual.
      return "Pendiente";
    }

    // 3) CUFE/CUDE: comparar UUID del XML con el calculado
    const uuidNode = get(doc, "UUID") || get(doc, "cbc:UUID");
    const uuidXML = asString(uuidNode);
    const cufeCalc = calcularCUFE(doc);

    if (!uuidXML) {
      return "Pendiente"; // no tiene UUID -> pendiente
    }
    if (!cufeCalc) {
      return "Rechazado";
    }

    // Comparar (ignorando guiones y mayúsculas)
    const norm = (s) => String(s || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (norm(uuidXML) !== norm(cufeCalc)) {
      return "Rechazado";
    }

    // TODO (opcional): verificación criptográfica de la firma XML con xml-crypto / certificado.
    // Si quieres, lo integro si me pasas el certificado o la forma de validarlo.

    return "Aceptado";
  } catch (e) {
    console.error("Error en validarDIAN:", e);
    return "Rechazado";
  }
};

/* Middleware auth (igual que antes) */
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "No autenticado" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = parseInt(payload.sub, 10);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
};

/* SUBIR XML */
router.post("/upload", authMiddleware, upload.single("archivo"), async (req, res) => {
  try {
    const { file } = req;
    if (!file) return res.status(400).json({ error: "Archivo no subido" });

    if (!file.mimetype.includes("xml")) {
      try { fs.unlinkSync(file.path); } catch {}
      return res.status(400).json({ error: "Solo se aceptan archivos XML" });
    }

    const parsed = await parseXML(file.path);
    const rootKey = Object.keys(parsed)[0];
    const docInfo = parsed[rootKey];

    // Normalizar tipo raíz (Invoice / CreditNote / DebitNote)
    const rootSimple = rootKey.includes(":") ? rootKey.split(":").pop() : rootKey;
    let tipo = rootSimple;
    if (/invoice/i.test(rootSimple)) tipo = "Factura";
    if (/creditnote/i.test(rootSimple)) tipo = "Nota Crédito";
    if (/debitnote/i.test(rootSimple)) tipo = "Nota Débito";

    // CUFE / CUDE (tomamos el UUID tal cual venga)
    const uuidNode = get(docInfo, "UUID") || get(docInfo, "cbc:UUID");
    const cufe = asString(uuidNode) || null;

    // INFO DEL CLIENTE (robusto)
    const partyNode = getNested(docInfo, ["AccountingCustomerParty"]) || getNested(docInfo, ["AccountingSupplierParty"]);
    const party = partyNode ? (get(partyNode, "Party") || partyNode) : null;

    const empresa = party ? (get(party, "PartyLegalEntity") || getNested(party, ["PartyLegalEntity"])) : null;
    const persona = party ? (get(party, "Person") || getNested(party, ["Person"])) : null;

    const clienteNIT = asString(get(empresa, "CompanyID") || get(persona, "ID")) || "00000000";

    let nombreCliente = null;
    let razonSocial = null;

    if (empresa) {
      const regName = asString(get(empresa, "RegistrationName") || get(empresa, "Name"));
      if (regName && /(SAS|LTDA|S\.A\.|S A S|S\.A\.S)/i.test(regName)) {
        razonSocial = regName;
      } else {
        nombreCliente = regName;
      }
    }

    if (persona) {
      const nombres = asString(get(persona, "FirstName")) || "";
      const apellidos = asString(get(persona, "FamilyName")) || "";
      nombreCliente = `${nombres} ${apellidos}`.trim() || nombreCliente;
    }

    // Buscar o crear cliente
    let cliente = await prisma.clientes.findFirst({
      where: {
        id_usuario: req.userId,
        numero_documento: clienteNIT
      }
    });

    if (!cliente) {
      cliente = await prisma.clientes.create({
        data: {
          id_usuario: req.userId,
          nombre_completo: nombreCliente,
          numero_documento: clienteNIT,
          razon_social: razonSocial,
          tipo_documento: asString(get(party, "DocumentTypeCode")) || "CC",
        }
      });
    }

    // OBTENER LÍNEAS robusto
    const obtenerLineas = (doc) => {
      const keys = Object.keys(doc);
      const posibles = keys.filter(k =>
        k.toLowerCase().includes("invoiceline") ||
        k.toLowerCase().includes("creditnoteline") ||
        k.toLowerCase().includes("debitnoteline")
      );
      if (posibles.length === 0) return [];
      const lineas = doc[posibles[0]];
      return Array.isArray(lineas) ? lineas : [lineas];
    };

    const productos = obtenerLineas(docInfo);

    // Totales
    const legales = get(docInfo, "LegalMonetaryTotal") || {};
    const tax = get(docInfo, "TaxTotal") || {};

    const subtotal = asNumber(get(legales, "LineExtensionAmount") || get(legales, "TaxExclusiveAmount"));
    const total = asNumber(get(legales, "PayableAmount") || get(legales, "TaxInclusiveAmount"));
    const impuestos = asNumber(get(tax, "TaxAmount"));

    // Fecha + hora
    let xmlFecha = asString(get(docInfo, "IssueDate")) || null;
    let xmlHora = asString(get(docInfo, "IssueTime")) || "00:00:00-05:00";
    if (xmlHora.length === 8) xmlHora += "-05:00";
    let fechaEmision = xmlFecha ? new Date(`${xmlFecha}T${xmlHora}`) : new Date();

    // Rangos y consecutivos (igual que antes)
    const tipoRango = tipo === "Factura" ? "FACTURA" : tipo === "Nota Crédito" ? "NC" : tipo === "Nota Débito" ? "ND" : null;

    const rango = await prisma.rangos.findFirst({
      where: { id_usuario: req.userId, tipo: tipoRango },
      orderBy: { id: "desc" }
    });

    if (!rango) return res.status(400).json({ error: "No existe rango configurado para este tipo de documento" });

    const ultimo = await prisma.documentos_XML.findFirst({
      where: {
        id_usuario: req.userId,
        tipo_documento: tipo,
        consecutivo_completo: { startsWith: rango.prefijo }
      },
      orderBy: { id_documento: "desc" }
    });

    let siguienteNumero = rango.inicio;
    if (ultimo) siguienteNumero = parseInt(ultimo.numero_documento) + 1;
    if (siguienteNumero > rango.fin) return res.status(400).json({ error: `El rango ${rango.inicio}-${rango.fin} está agotado` });

    const consecutivoCompleto = `${rango.prefijo}${siguienteNumero}`;
    let nuevoEstado = "Activo";
    if (siguienteNumero >= rango.fin) nuevoEstado = "Inactivo";

    await prisma.rangos.update({ where: { id: rango.id }, data: { estado: nuevoEstado } });

    // APLICAR VALIDACIÓN DIAN REAL
    const estado = validarDIAN(docInfo);

    // Guardar documento
    const newDoc = await prisma.documentos_XML.create({
      data: {
        tipo_documento: tipo,
        numero_documento: String(siguienteNumero),
        consecutivo_completo: consecutivoCompleto,
        fecha_emision: fechaEmision,
        subtotal,
        impuestos,
        valor_total: total,
        moneda: asString(get(docInfo, "DocumentCurrencyCode")) || "COP",
        xml_archivo: path.resolve(file.path),
        xml_json: parsed,
        cufe,
        estado_dian: estado,
        Clientes: { connect: { id_cliente: cliente.id_cliente } },
        Usuarios: { connect: { id_usuario: req.userId } },
        Producto_Factura: {
          create: productos.map((p) => {
            const item = get(p, "Item") || p;
            const descripcion = asString(get(item, "Description") || get(item, "Name")) || "-";
            const cantidadNode = get(p, "InvoicedQuantity") || get(p, "CreditedQuantity") || get(p, "DebitedQuantity");
            const cantidad = asNumber(cantidadNode);
            let unidad_medida = null;
            const cantidadKey = keyFor(p, "InvoicedQuantity") || keyFor(p, "CreditedQuantity") || keyFor(p, "DebitedQuantity");
            if (cantidadKey && p[cantidadKey] && p[cantidadKey].$ && p[cantidadKey].$.unitCode) unidad_medida = p[cantidadKey].$.unitCode;
            const precioNode = get(p, "Price") ? get(get(p, "Price"), "PriceAmount") : get(p, "PriceAmount");
            const precio_unitario = asNumber(precioNode);
            const ivaNode = get(item, "ClassifiedTaxCategory") ? get(get(item, "ClassifiedTaxCategory"), "Percent") : get(item, "Percent");
            const iva = asNumber(ivaNode);
            const totalNode = get(p, "LineExtensionAmount");
            const totalLinea = asNumber(totalNode);
            return {
              descripcion,
              cantidad,
              unidad_medida,
              precio_unitario,
              iva,
              total: totalLinea
            };
          })
        },
      },
      include: { Producto_Factura: true },
    });

    return res.json({
      message: "XML procesado correctamente",
      documento: newDoc,
    });
  } catch (err) {
    console.error("Error en /upload:", err);
    res.status(500).json({ error: "Error procesando el XML" });
  }
});

/* Resto de endpoints (sin cambios funcionales) */
router.get("/data", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const docs = await prisma.documentos_XML.findMany({
      where: { id_usuario: userId },
      orderBy: { fecha_emision: "desc" },
      take: 50,
      include: { Producto_Factura: true },
    });

    const estadosRaw = await prisma.documentos_XML.groupBy({
      by: ["estado_dian"],
      _count: { estado_dian: true },
      where: { id_usuario: userId },
    });

    const estadisticas = { Aceptado: 0, Rechazado: 0, Pendiente: 0 };
    estadosRaw.forEach((e) => {
      const key = (e.estado_dian || "").toLowerCase();
      if (key === "aceptado") estadisticas.Aceptado = e._count.estado_dian;
      if (key === "rechazado") estadisticas.Rechazado = e._count.estado_dian;
      if (key === "pendiente") estadisticas.Pendiente = e._count.estado_dian;
    });

    const tiposRaw = await prisma.documentos_XML.groupBy({
      by: ["tipo_documento"],
      _count: { tipo_documento: true },
      where: { id_usuario: userId },
    });

    const tipos = { Factura: 0, "Nota Crédito": 0, "Nota Débito": 0 };
    tiposRaw.forEach((t) => {
      const key = (t.tipo_documento || "").toLowerCase();
      if (key.includes("factura")) tipos.Factura = t._count.tipo_documento;
      if (key.includes("crédito") || key.includes("credito")) tipos["Nota Crédito"] = t._count.tipo_documento;
      if (key.includes("debito") || key.includes("débito")) tipos["Nota Débito"] = t._count.tipo_documento;
    });

    const total = tipos.Factura + tipos["Nota Crédito"] + tipos["Nota Débito"];

    res.json({ docs, estadisticas, tipos, total });
  } catch (err) {
    console.error("Error en /data:", err);
    res.status(500).json({ error: "Error al cargar datos" });
  }
});

router.get("/historial", authMiddleware, async (req, res) => {
  try {
    const docs = await prisma.documentos_XML.findMany({
      where: { id_usuario: req.userId },
      orderBy: { fecha_emision: "desc" },
      include: { Producto_Factura: true }
    });
    res.json(docs);
  } catch (err) {
    console.error("Error en historial:", err);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

router.get("/ver-xml/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await prisma.documentos_XML.findUnique({ where: { id_documento: id } });
    if (!doc) return res.status(404).send("Documento no encontrado");
    if (!doc.xml_archivo || !fs.existsSync(doc.xml_archivo)) return res.status(404).send("Archivo XML no disponible");
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    const xmlContent = fs.readFileSync(doc.xml_archivo, "utf8");
    res.send(xmlContent);
  } catch (err) {
    console.error("Error en /ver-xml/:id", err);
    res.status(500).send("Error interno al mostrar XML");
  }
});

export default router;
