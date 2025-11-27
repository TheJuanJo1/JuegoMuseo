import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import path from "path";
import xml2js from "xml2js";

const router = Router();
const upload = multer({ dest: "uploads/" });

// Parsear XML
const parseXML = async (filePath) => {
  const xmlData = fs.readFileSync(filePath, "utf-8");
  return await xml2js.parseStringPromise(xmlData, { explicitArray: false });
};

// Validación DIAN
const validarDIAN = (doc) => {
  const uuid = doc["cbc:UUID"]?._ || "";
  const id = doc["cbc:ID"] || "";
  const fecha = doc["cbc:IssueDate"] || "";
  const productos =
    doc["cac:InvoiceLine"] ||
    doc["cac:CreditNoteLine"] ||
    doc["cac:DebitNoteLine"];

  const legales = doc["cac:LegalMonetaryTotal"];
  const tax = doc["cac:TaxTotal"];

  // Si faltan cosas estructurales → Rechazado
  if (!id || !fecha || !productos || !legales) {
    return "Rechazado";
  }

  // 🕓 Si el UUID existe pero NO es un CUFE real → Pendiente
  if (
    !uuid ||
    uuid.trim() === "" ||
    uuid === "00000000-0000-0000-0000-000000000000"
  ) {
    return "Pendiente";
  }

  // ✔ Si pasa todo → Aceptado
  return "Aceptado";
};

// Middleware auth
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

// SUBIR XML
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

    // Normalizar tipo
    let tipo = rootKey;
    if (rootKey === "Invoice") tipo = "Factura";
    if (rootKey === "CreditNote") tipo = "Nota Crédito";
    if (rootKey === "DebitNote") tipo = "Nota Débito";

    // CUFE / CUDE
    const cufe = docInfo["cbc:UUID"]?._ || null;

    // Productos
    const lineas =
      docInfo["cac:InvoiceLine"] ||
      docInfo["cac:CreditNoteLine"] ||
      docInfo["cac:DebitNoteLine"];
    const productos = lineas ? (Array.isArray(lineas) ? lineas : [lineas]) : [];

    // Totales
    const legales = docInfo["cac:LegalMonetaryTotal"] || {};
    const tax = docInfo["cac:TaxTotal"] || {};

    const subtotal = parseFloat(legales["cbc:LineExtensionAmount"]?._ || 0);
    const total = parseFloat(legales["cbc:PayableAmount"]?._ || 0);
    const impuestos = parseFloat(tax["cbc:TaxAmount"]?._ || 0);

    // ⭐ APLICAR VALIDACIÓN DIAN AQUÍ
    const estado = validarDIAN(docInfo);

    const newDoc = await prisma.documentos_XML.create({
      data: {
        tipo_documento: tipo,
        numero_documento: docInfo["cbc:ID"] || "",
        fecha_emision: docInfo["cbc:IssueDate"]
          ? new Date(docInfo["cbc:IssueDate"])
          : new Date(),
        subtotal,
        impuestos,
        valor_total: total,
        moneda: docInfo["cbc:DocumentCurrencyCode"] || "COP",
        xml_archivo: path.resolve(file.path),
        xml_json: parsed,
        cufe,
        estado_dian: estado,

        Usuarios: {
          connect: { id_usuario: req.userId }
        },

        Producto_Factura: {
          create: productos.map((p) => ({
            descripcion: p["cac:Item"]?.["cbc:Description"] || "-",
            cantidad: parseFloat(
              p["cbc:InvoicedQuantity"]?._ || p["cbc:InvoicedQuantity"] || 0
            ),
            unidad_medida: p["cbc:InvoicedQuantity"]?.["$"]?.unitCode || null,
            precio_unitario: parseFloat(
              p["cac:Price"]?.["cbc:PriceAmount"]?._ ||
                p["cac:Price"]?.["cbc:PriceAmount"] ||
                0
            ),
            iva: parseFloat(
              p["cac:Item"]?.["cac:ClassifiedTaxCategory"]?.["cbc:Percent"] || 0
            ),
            total: parseFloat(
              p["cbc:LineExtensionAmount"]?._ ||
                p["cbc:LineExtensionAmount"] ||
                0
            ),
          })),
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

// DASHBOARD
// DASHBOARD
router.get("/data", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const docs = await prisma.documentos_XML.findMany({
      where: { id_usuario: userId },
      orderBy: { fecha_emision: "desc" },
      take: 50,
      include: { Producto_Factura: true },
    });

    // ESTADÍSTICAS DE ESTADO
    const estadosRaw = await prisma.documentos_XML.groupBy({
      by: ["estado_dian"],
      _count: { estado_dian: true },
      where: { id_usuario: userId },
    });

    const estadisticas = {
      Aceptado: 0,
      Rechazado: 0,
      Pendiente: 0,
    };

    estadosRaw.forEach((e) => {
      const key = (e.estado_dian || "").toLowerCase();
      if (key === "aceptado") estadisticas.Aceptado = e._count.estado_dian;
      if (key === "rechazado") estadisticas.Rechazado = e._count.estado_dian;
      if (key === "pendiente") estadisticas.Pendiente = e._count.estado_dian;
    });

    // ESTADÍSTICAS POR TIPO
    const tiposRaw = await prisma.documentos_XML.groupBy({
      by: ["tipo_documento"],
      _count: { tipo_documento: true },
      where: { id_usuario: userId },
    });

    const tipos = {
      Factura: 0,
      "Nota Crédito": 0,
      "Nota Débito": 0,
    };

    tiposRaw.forEach((t) => {
      const key = (t.tipo_documento || "").toLowerCase();
      if (key.includes("factura")) tipos.Factura = t._count.tipo_documento;
      if (key.includes("crédito") || key.includes("credito")) tipos["Nota Crédito"] = t._count.tipo_documento;
      if (key.includes("debito") || key.includes("débito")) tipos["Nota Débito"] = t._count.tipo_documento;
    });

    const total = tipos.Factura + tipos["Nota Crédito"] + tipos["Nota Débito"];

    res.json({
      docs,
      estadisticas,
      tipos,
      total
    });
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

export default router;
