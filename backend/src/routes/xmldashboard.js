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

// ----------------- Helpers -----------------
function keyFor(obj, target) {
  if (!obj || typeof obj !== "object") return null;
  const keys = Object.keys(obj);
  for (const k of keys) {
    if (k === target) return k;
    if (k.endsWith(`:${target}`)) return k;
    if (k.toLowerCase() === target.toLowerCase()) return k;
    if (k.toLowerCase().endsWith(`:${target.toLowerCase()}`)) return k;
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
    if (typeof node.$ === "object" && Object.keys(node).length === 1)
      return node.$;
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

const parseXML = async (filePath) => {
  let xmlData = fs.readFileSync(filePath, "utf-8");
  if (xmlData.charCodeAt(0) === 0xfeff) xmlData = xmlData.slice(1);
  return await xml2js.parseStringPromise(xmlData, { explicitArray: false });
};

function extraerDireccion(cliente) {
  if (!cliente) return null;

  const posiblesRutas = [
    ["PostalAddress", "AddressLine", "Line"], 
    ["PostalAddress", "StreetName"],
    ["PostalAddress", "Line"],
    ["PhysicalLocation", "Address", "Line1"],
    ["PhysicalLocation", "Address", "StreetName"],
    ["PartyLegalEntity", "PostalAddress", "AddressLine", "Line"],
    ["PartyLegalEntity", "PostalAddress", "StreetName"],
    ["PartyLegalEntity", "PhysicalLocation", "Address", "Line1"],
    ["PartyLegalEntity", "PhysicalLocation", "Address", "StreetName"],
    ["PartyTaxScheme", "RegistrationAddress", "AddressLine", "Line"],
    ["PartyTaxScheme", "RegistrationAddress", "StreetName"],
  ];

  for (const ruta of posiblesRutas) {
    let valor = cliente;
    for (const p of ruta) {
      if (!valor) break;
      const k = keyFor(valor, p);
      if (!k) {
        valor = null;
        break;
      }
      valor = valor[k];
      if (Array.isArray(valor)) valor = valor[0];
    }
    if (valor) return asString(valor);
  }

  return null;
}

function extraerDireccionCliente(clienteParty) {
  if (!clienteParty) return null;

  const rutasValidas = [
    ["PostalAddress", "StreetName"],
    ["PostalAddress", "AddressLine", "Line"],
    ["PhysicalLocation", "Address", "Line1"],
    ["PartyLegalEntity", "PostalAddress", "StreetName"],
    ["PartyLegalEntity", "PostalAddress", "AddressLine", "Line"],
    ["PartyLegalEntity", "PhysicalLocation", "Address", "Line1"],
    ["PartyLegalEntity", "PhysicalLocation", "Address", "StreetName"],
    ["PartyTaxScheme", "RegistrationAddress", "StreetName"],
    ["PartyTaxScheme", "RegistrationAddress", "AddressLine", "Line"],
  ];

  for (const ruta of rutasValidas) {
    let nodo = clienteParty;
    for (const key of ruta) {
      if (!nodo) break;
      const k = keyFor(nodo, key);
      if (!k) {
        nodo = null;
        break;
      }
      nodo = nodo[k];
      if (Array.isArray(nodo)) nodo = nodo[0];
    }
    if (nodo) return asString(nodo);
  }

  return null;
}

const calcularCUFE = (doc) => {
  try {
    const id = asString(
      get(doc, "ID") || get(doc, "InvoiceID") || get(doc, "CreditNoteID")
    );
    const fecha = asString(get(doc, "IssueDate"));
    const hora = asString(get(doc, "IssueTime")) || "";
    const total = asString(
      getNested(doc, ["LegalMonetaryTotal", "PayableAmount"]) ||
        getNested(doc, ["RequestedMonetaryTotal", "PayableAmount"])
    );
    const impuestos =
      asString(getNested(doc, ["TaxTotal", "TaxAmount"])) || "0";
    const nitEmisor =
      asString(
        getNested(doc, [
          "AccountingSupplierParty",
          "Party",
          "PartyTaxScheme",
          "CompanyID",
        ]) ||
          getNested(doc, [
            "AccountingSupplierParty",
            "Party",
            "PartyIdentification",
            "ID",
          ])
      ) || "";
    const nitReceptor =
      asString(
        getNested(doc, [
          "AccountingCustomerParty",
          "Party",
          "PartyTaxScheme",
          "CompanyID",
        ]) ||
          getNested(doc, [
            "AccountingCustomerParty",
            "Party",
            "PartyIdentification",
            "ID",
          ])
      ) || "";
    const clave = process.env.CLAVE_TECNICA || "";
    const cadena = `${id}${fecha}${hora}${total}${impuestos}${nitEmisor}${nitReceptor}${clave}`;
    return crypto
      .createHash("sha384")
      .update(cadena)
      .digest("hex")
      .toUpperCase();
  } catch (e) {
    console.error("Error calculando CUFE:", e);
    return null;
  }
};

const validarDIAN = (doc) => {
  try {
    const tieneID = !!asString(get(doc, "cbc:ID") || get(doc, "ID"));
    const tieneFecha = !!asString(
      get(doc, "cbc:IssueDate") || get(doc, "IssueDate")
    );
    if (!tieneID || !tieneFecha) return "Rechazado";
    const tieneSupplier =
      !!get(doc, "cac:AccountingSupplierParty") ||
      !!get(doc, "AccountingSupplierParty");
    const tieneCustomer =
      !!get(doc, "cac:AccountingCustomerParty") ||
      !!get(doc, "AccountingCustomerParty");
    if (!tieneSupplier || !tieneCustomer)
      console.warn(
        "Proveedor o cliente no encontrados, pero se acepta el documento"
      );
    return "Aceptado";
  } catch (e) {
    console.error("Error en validarDIAN:", e);
    return "Rechazado";
  }
};

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

router.post(
  "/upload",
  authMiddleware,
  upload.single("archivo"),
  async (req, res) => {
    try {
      const { file } = req;
      if (!file) return res.status(400).json({ error: "Archivo no subido" });
      if (!file.mimetype.includes("xml")) {
        try {
          fs.unlinkSync(file.path);
        } catch {}
        return res.status(400).json({ error: "Solo se aceptan archivos XML" });
      }

      let parsed = await parseXML(file.path);

      // Normalizar keys para ignorar namespaces
      function normalizeKeys(obj) {
        if (!obj || typeof obj !== "object") return obj;
        const newObj = {};
        Object.keys(obj).forEach((k) => {
          const cleanKey = k.includes(":") ? k.split(":").pop() : k;
          newObj[cleanKey] = normalizeKeys(obj[k]);
        });
        return newObj;
      }
      parsed = normalizeKeys(parsed);

      let rootKey = Object.keys(parsed)[0];
      let docInfo = parsed[rootKey];
      let rootSimple = rootKey.includes(":")
        ? rootKey.split(":").pop()
        : rootKey;

      // Manejo de AttachedDocument
      if (/attacheddocument/i.test(rootSimple)) {
        let innerXML = null;
        let embedded =
          getNested(docInfo, ["Attachment", "EmbeddedDocumentBinaryObject"]) ||
          getNested(docInfo, [
            "cac:Attachment",
            "cac:EmbeddedDocumentBinaryObject",
          ]);
        if (embedded)
          innerXML = Buffer.from(embedded._ || embedded, "base64").toString(
            "utf8"
          );
        else {
          let cdataXML =
            getNested(docInfo, [
              "Attachment",
              "ExternalReference",
              "Description",
            ]) ||
            getNested(docInfo, [
              "cac:Attachment",
              "cac:ExternalReference",
              "cbc:Description",
            ]);
          if (cdataXML)
            innerXML =
              typeof cdataXML === "object" && "_" in cdataXML
                ? cdataXML._
                : cdataXML;
        }
        if (!innerXML)
          return res
            .status(400)
            .json({
              error: "No se encontró la factura dentro del AttachedDocument",
            });
        parsed = normalizeKeys(
          await xml2js.parseStringPromise(innerXML, { explicitArray: false })
        );
        rootKey = Object.keys(parsed)[0];
        docInfo = parsed[rootKey];
        rootSimple = rootKey.includes(":") ? rootKey.split(":").pop() : rootKey;
      }

      // Tipo de documento
      let tipo = rootSimple;
      if (/invoice/i.test(rootSimple)) tipo = "Factura";
      if (/creditnote/i.test(rootSimple)) tipo = "Nota Crédito";
      if (/debitnote/i.test(rootSimple)) tipo = "Nota Débito";

      // CUFE
      const uuidNode =
        getNested(docInfo, ["UUID"]) || getNested(docInfo, ["cbc:UUID"]);
      const cufe = asString(uuidNode) || calcularCUFE(docInfo);

      // Emisor y Cliente
      const supplierParty =
        getNested(docInfo, ["AccountingSupplierParty", "Party"]) || {};
      const customerParty =
        getNested(docInfo, ["AccountingCustomerParty", "Party"]) || {};

      const nitEmisor =
        asString(
          getNested(supplierParty, ["PartyTaxScheme", "CompanyID"]) ||
            getNested(supplierParty, ["PartyIdentification", "ID"])
        ) || "";
      const nitReceptor =
        asString(
          getNested(customerParty, ["PartyTaxScheme", "CompanyID"]) ||
            getNested(customerParty, ["PartyIdentification", "ID"])
        ) || "";

      // Mapas de traducción según códigos DIAN
const formaPagoMap = { 1: "Contado", 47: "Crédito" };
const medioPagoMap = {
  10: "Efectivo",
  20: "Cheque",
  31: "Transferencia",
  41: "Tarjeta crédito",
  42: "Tarjeta débito",
  // agrega más según tu necesidad
};

// --- Función para extraer datos de PaymentMeans ---
function extraerPago(doc) {
  const paymentNode =
    getNested(doc, ["PaymentMeans"]) ||
    getNested(doc, ["cac:PaymentMeans"]) ||
    getNested(doc, ["PaymentTerms", "PaymentMeans"]); // fallback

  let forma = "Desconocido";
  let medio = "Desconocido";

  if (paymentNode) {
    // Forma de pago
    const formaCode =
      asString(paymentNode.PaymentMeansCode) ||
      asString(paymentNode["cbc:PaymentMeansCode"]);
    if (formaCode && formaPagoMap[formaCode]) forma = formaPagoMap[formaCode];

    // Medio de pago
    const medioCode =
      asString(paymentNode.PaymentMeansCode) || // algunos XML usan el mismo nodo
      asString(paymentNode.PaymentMeansText) ||
      asString(paymentNode["cbc:PaymentMeansText"]);
    if (medioCode && medioPagoMap[medioCode]) medio = medioPagoMap[medioCode];
  }

  return { forma, medio };
}

// --- Función para extraer tipo de operación ---
function extraerTipoOperacion(doc) {
  const tipo =
    asString(getNested(doc, ["InvoiceTypeCode"])) ||
    asString(getNested(doc, ["cbc:InvoiceTypeCode"])) ||
    "Desconocido";
  return tipo;
}

const { forma: formaPago, medio: medioPago } = extraerPago(docInfo);
const tipoOperacion = extraerTipoOperacion(docInfo);


      // Fechas
      let xmlFecha = asString(get(docInfo, "IssueDate")) || null;
      let xmlHora = asString(get(docInfo, "IssueTime")) || "00:00:00-05:00";
      if (xmlHora.length === 8) xmlHora += "-05:00";
      const fechaEmision = xmlFecha
        ? new Date(`${xmlFecha}T${xmlHora}`)
        : new Date();
      const fechaVencimientoRaw =
  asString(
    getNested(docInfo, ["PaymentTerms", "DueDate"]) ||
    getNested(docInfo, ["PaymentTerms", "PaymentDueDate"]) ||
    getNested(docInfo, ["cbc:DueDate"]) ||
    getNested(docInfo, ["cbc:PaymentDueDate"])
  ) || null;

const fechaVencimiento = fechaVencimientoRaw
  ? new Date(fechaVencimientoRaw)
  : null;


      // Totales
      const legales = get(docInfo, "LegalMonetaryTotal") || {};
      const tax = get(docInfo, "TaxTotal") || {};
      const subtotal = asNumber(
        get(legales, "LineExtensionAmount") ||
          get(legales, "TaxExclusiveAmount")
      );
      const total = asNumber(
        get(legales, "PayableAmount") || get(legales, "TaxInclusiveAmount")
      );
      const impuestos = asNumber(get(tax, "TaxAmount"));


const cliente_numero_documento =
  asString(
    getNested(customerParty, ["PartyTaxScheme", "CompanyID"]) ||
    getNested(customerParty, ["PartyIdentification", "ID"])
  ) || crypto.randomUUID();

const cliente_nombre =
  asString(
    getNested(customerParty, ["PartyLegalEntity", "RegistrationName"]) ||
    getNested(customerParty, ["PartyName", "Name"]) ||
    getNested(customerParty, ["Person", "FirstName"])
  ) || "Cliente sin nombre";

const cliente_correo =
  asString(getNested(customerParty, ["Contact", "ElectronicMail"])) || null;

const cliente_telefono =
  asString(getNested(customerParty, ["Contact", "Telephone"])) || null;

const cliente_direccion = extraerDireccionCliente(customerParty);

const cliente_ciudad =
  asString(
    getNested(customerParty, ["PostalAddress", "CityName"]) ||
    getNested(customerParty, ["PhysicalLocation", "Address", "CityName"])
  ) || null;

const cliente_departamento =
  asString(
    getNested(customerParty, ["PhysicalLocation", "Address", "Region"])
  ) || null;

// --- Crear un nuevo registro de cliente para este XML ---
const clienteRegistro = await prisma.Clientes.create({
  data: {
    id_usuario: req.userId,
    tipo_documento: "CC",
    numero_documento: cliente_numero_documento,
    nombre_completo: cliente_nombre,
    razon_social: cliente_nombre,
    correo_cliente: cliente_correo,
    telefono: cliente_telefono,
    direccion_cliente: cliente_direccion,
    ciudad: cliente_ciudad,
    departamento: cliente_departamento,
  },
});

// obtener nombre del usuario (por si quieres guardarlo en nombre_usuario)
let nombreUsuario = null;
try {
  const u = await prisma.usuarios.findUnique({ where: { id_usuario: req.userId }, select: { nombre_usuario: true }});
  nombreUsuario = u?.nombre_usuario || null;
} catch(e) {
  console.warn("No se pudo obtener nombre de usuario para registro:", e);
}



      // Productos / líneas
      const lineKeys = Object.keys(docInfo).filter((k) =>
        /invoiceline|creditnoteline|debitnoteline/i.test(k)
      );
      let lineas = [];
      lineKeys.forEach((k) => {
        const l = docInfo[k];
        if (Array.isArray(l)) lineas.push(...l);
        else lineas.push(l);
      });
      
// Función recursiva para buscar IVA en cualquier parte de un objeto
function buscarIVA(obj) {
  if (!obj || typeof obj !== "object") return null;

  if ("Percent" in obj) return asNumber(obj.Percent);

  for (const key in obj) {
    const valor = obj[key];
    if (typeof valor === "object") {
      const encontrado = buscarIVA(valor);
      if (encontrado !== null) return encontrado;
    }
  }

  return null;
}

const productos = lineas.map((p) => {
  const item = get(p, "Item") || {};

  const descripcion = asString(item.Description || item.Name) || "-";

  const cantidadNode =
    get(p, "InvoicedQuantity") ||
    get(p, "CreditedQuantity") ||
    get(p, "DebitedQuantity");
  const cantidad = asNumber(cantidadNode);
  const unidad_medida = cantidadNode?.$.unitCode || null;

  const precioNode = get(p, "Price")
    ? get(p.Price, "PriceAmount")
    : get(p, "PriceAmount");
  const precio_unitario = asNumber(precioNode);

  // Buscar IVA en cualquier parte de la línea
  const iva = buscarIVA(p);

  const totalNode =
    get(p, "LineExtensionAmount") || get(p, "cbc:LineExtensionAmount");
  const totalLinea = asNumber(totalNode);

  return {
    descripcion,
    cantidad,
    unidad_medida,
    precio_unitario,
    iva,
    total: totalLinea,
  };
});


const documentosCount = await prisma.Documentos_XML.count({
  where: { id_usuario: req.userId, tipo_documento: tipo }
});
const siguienteNumero = documentosCount + 1;
const consecutivoCompleto = `${tipo.substring(0,3).toUpperCase()}-${siguienteNumero}`;


      const emisor_nombre = asString(
        getNested(supplierParty, ["PartyLegalEntity", "RegistrationName"]) ||
          getNested(supplierParty, ["PartyName", "Name"]) ||
          getNested(supplierParty, ["Person", "FirstName"]) ||
          ""
      );
      const emisor_nombre_comercial =
        asString(
          getNested(supplierParty, ["PartyLegalEntity", "CompanyID"])
            ? getNested(supplierParty, ["PartyLegalEntity", "RegistrationName"])
            : ""
        ) || "";
      const emisor_nit = nitEmisor || "";
      const emisor_direccion = extraerDireccion(supplierParty);

      const emisor_ciudad =
  asString(
    getNested(supplierParty, ["PostalAddress", "CityName"]) ||
    getNested(supplierParty, ["PhysicalLocation", "Address", "CityName"])
  ) || "";
      const emisor_departamento =
        asString(getNested(supplierParty, ["PostalAddress", "Region"])) || "";
      const emisor_pais =
        asString(
          getNested(supplierParty, [
            "PostalAddress",
            "Country",
            "IdentificationCode",
          ])
        ) || "";
      const emisor_telefono =
        asString(
          getNested(supplierParty, ["Contact", "Telephone"]) ||
            getNested(supplierParty, [
              "Contact",
              "Telephone",
              "TelephoneNumber",
            ])
        ) || "";
      const emisor_correo =
        asString(
          getNested(supplierParty, ["Contact", "ElectronicMail"]) ||
            getNested(supplierParty, ["Contact", "ElectronicMailAddress"])
        ) || "";
      const emisor_tipo_contribuyente =
        asString(
          getNested(supplierParty, ["PartyTaxScheme", "RegistrationName"]) || ""
        ) || "";
      const emisor_regimen =
        asString(
          getNested(supplierParty, ["PartyTaxScheme", "CompanyID"]) || ""
        ) || "";

      const estado = validarDIAN(docInfo);

      const newDoc = await prisma.Documentos_XML.create({
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
          forma_pago: formaPago,
          medio_pago: medioPago,
          fecha_vencimiento: fechaVencimiento,
          
          nombre_cliente: cliente_nombre,
    razon_social_cliente: cliente_nombre,
    correo_cliente: cliente_correo,
    telefono_cliente: cliente_telefono,
    direccion_cliente: cliente_direccion,
    ciudad_cliente: cliente_ciudad,
    departamento_cliente: cliente_departamento,

          razon_social_emisor: emisor_nombre || undefined,
          nombre_comercial_emisor: emisor_nombre_comercial || undefined,
          nit_emisor: emisor_nit || undefined,
          direccion_emisor: emisor_direccion || undefined,
          ciudad_emisor: emisor_ciudad || undefined,
          departamento_emisor: emisor_departamento || undefined,
          pais_emisor: emisor_pais || undefined,
          telefono_emisor: emisor_telefono || undefined,
          correo_emisor: emisor_correo || undefined,
          tipo_contribuyente_emisor: emisor_tipo_contribuyente || undefined,
          regimen_fiscal_emisor: emisor_regimen || undefined,

          
          Clientes: { connect: { id_cliente: clienteRegistro.id_cliente } },
          Usuarios: { connect: { id_usuario: req.userId } },
          Producto_Factura: { create: productos },
        },
        include: { Producto_Factura: true },
      });
      await prisma.Registros_Sistema.create({
  data: {
    id_usuario: req.userId,
    nombre_usuario: nombreUsuario,         
    empresa: nombreUsuario || undefined,    
    tipo_documento: tipo || "Desconocido",
    numero_documento: `${tipo.substring(0,3).toUpperCase()}-${siguienteNumero}` || asString(get(docInfo, "ID")) || cufe || null,
    accion: "Validación XML",
    resultado: estado || "Pendiente",
    mensaje: `Documento creado: id_documento=${newDoc.id_documento}`
  }
});
      res.json({
        message: "XML procesado correctamente",
        documento: newDoc,
      });
    } catch (err) {
      console.error("Error en /upload:", err);
      res.status(500).json({ error: "Error procesando el XML" });
    }
  }
);


router.get("/data", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const docs = await prisma.Documentos_XML.findMany({
      where: { id_usuario: userId },
      orderBy: { numero_factura: "desc" },
      take: 50,
      include: { Producto_Factura: true, Usuarios: true, Clientes: true },
    });

    const estadosRaw = await prisma.Documentos_XML.groupBy({
      by: ["estado_dian"],
      _count: { estado_dian: true },
      where: { id_usuario: userId },
    });
    const estadisticas = { Aceptado: 0, Rechazado: 0 };
    estadosRaw.forEach((e) => {
      const key = (e.estado_dian || "").toLowerCase();
      if (key === "aceptado") estadisticas.Aceptado = e._count.estado_dian;
      if (key === "rechazado") estadisticas.Rechazado = e._count.estado_dian;
    });
    const tiposRaw = await prisma.Documentos_XML.groupBy({
      by: ["tipo_documento"],
      _count: { tipo_documento: true },
      where: { id_usuario: userId },
    });
    const tipos = { Factura: 0, "Nota Crédito": 0, "Nota Débito": 0 };
    tiposRaw.forEach((t) => {
      const key = (t.tipo_documento || "").toLowerCase();
      if (key.includes("factura")) tipos.Factura = t._count.tipo_documento;
      if (key.includes("crédito") || key.includes("credito"))
        tipos["Nota Crédito"] = t._count.tipo_documento;
      if (key.includes("debito") || key.includes("débito"))
        tipos["Nota Débito"] = t._count.tipo_documento;
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
    const docsRaw = await prisma.Documentos_XML.findMany({
      where: { id_usuario: req.userId },
      orderBy: { numero_factura: "desc" },
      include: { Producto_Factura: true, Usuarios: true, Clientes: true },
    });
    const docs = docsRaw.map(doc => ({
      ...doc,
      Producto_Factura: doc.Producto_Factura.map(p => ({
        ...p,
        iva: Number(p.iva)   // ← AQUÍ SE ARREGLA TODO
      }))
    }));

    res.json(docs);
  } catch (err) {
    console.error("Error en historial:", err);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

router.get("/ver-xml/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await prisma.Documentos_XML.findUnique({
      where: { id_documento: id },
    });
    if (!doc) return res.status(404).send("Documento no encontrado");
    if (!doc.xml_archivo || !fs.existsSync(doc.xml_archivo))
      return res.status(404).send("Archivo XML no disponible");
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    const xmlContent = fs.readFileSync(doc.xml_archivo, "utf8");
    res.send(xmlContent);
  } catch (err) {
    console.error("Error en /ver-xml/:id", err);
    res.status(500).send("Error interno al mostrar XML");
  }
});

export default router;