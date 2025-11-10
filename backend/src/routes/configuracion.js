import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();
const firmasDir = path.join(process.cwd(), "uploads", "firmas");
if (!fs.existsSync(firmasDir)) {
  fs.mkdirSync(firmasDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, firmasDir),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const fileFilter = (req, file, cb) => {
  const allowed = [".p12", ".cer"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Formato no válido (.p12, .cer)"), false);
};

const upload = multer({ storage, fileFilter });
router.post("/", upload.single("certificado_firma"), async (req, res) => {
  try {
    const {
      direccion_empresa,
      regimen_tributario,
      contrasena_cert,
      token_api,
      fecha_expiracion,
      id_usuario,
      numeraciones,
      // datos opcionales del formulario
      prefijo_numeracion,
      numero_inicial,
      numero_final,
    } = req.body;

    const expDate = new Date(fecha_expiracion);
    if (expDate <= new Date()) {
      return res.status(400).json({
        error: "La fecha de expiración de la firma debe ser mayor a la fecha actual",
      });
    }

    const certificadoPath = req.file ? req.file.path : null;

    const existing = await prisma.Configuracion_Tecnica.findUnique({
      where: { id_usuario: parseInt(id_usuario) },
    });

    // Parsear numeraciones si vienen en JSON
    let numeracionesParseadas = [];
    try {
      numeracionesParseadas = numeraciones ? JSON.parse(numeraciones) : [];
    } catch {
      numeracionesParseadas = [];
    }

    // Si no hay numeraciones, se genera un rango global por defecto
    if (!existing && numeracionesParseadas.length === 0) {
      const inicial = numero_inicial ? parseInt(numero_inicial) : 1;
      numeracionesParseadas.push({
        id: Date.now(),
        tipo_documento: "Global",
        prefijo: prefijo_numeracion || "GEN",
        numero_inicial: inicial,
        numero_final: numero_final ? parseInt(numero_final) : inicial + 9999,
        resolucion: null,
        fecha_resolucion: new Date(),
        estado: "Activo",
        numero_actual: inicial - 1,
      });
    }

    // Asegurar número actual
    numeracionesParseadas = numeracionesParseadas.map((n) => ({
      ...n,
      numero_actual:
        n.numero_actual !== undefined && n.numero_actual !== null
          ? n.numero_actual
          : (n.numero_inicial || 1) - 1,
    }));

    let config;

    if (existing) {
      const numeracionesFinales =
        numeracionesParseadas.length > 0
          ? numeracionesParseadas
          : existing.numeraciones || [];

      const numeracionesAseguradas = numeracionesFinales.map((n) => ({
        ...n,
        numero_actual:
          n.numero_actual !== undefined && n.numero_actual !== null
            ? n.numero_actual
            : (n.numero_inicial || 1) - 1,
      }));

      config = await prisma.Configuracion_Tecnica.update({
        where: { id_usuario: parseInt(id_usuario) },
        data: {
          direccion_empresa,
          regimen_tributario,
          contrasena_cert,
          token_api,
          fecha_expiracion: expDate,
          certificado_firma: certificadoPath || existing.certificado_firma,
          numeraciones: numeracionesAseguradas,
        },
      });
    } else {
      config = await prisma.Configuracion_Tecnica.create({
        data: {
          direccion_empresa,
          regimen_tributario,
          contrasena_cert,
          token_api,
          fecha_expiracion: expDate,
          certificado_firma: certificadoPath,
          id_usuario: parseInt(id_usuario),
          numeraciones: numeracionesParseadas,
        },
      });
    }

    res.json({ mensaje: "Configuración guardada con éxito", config });
  } catch (error) {
    console.error("Error al guardar configuración:", error);
    res.status(500).json({ error: error.message });
  }
});

// === Verificar estado de configuración ===
router.get("/estado/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const config = await prisma.Configuracion_Tecnica.findUnique({
      where: { id_usuario: parseInt(id_usuario) },
    });
    res.json({ completado: !!config });
  } catch (error) {
    console.error("Error al verificar estado:", error);
    res.status(500).json({ error: "Error al verificar estado" });
  }
});

// === Obtener configuración completa ===
router.get("/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const config = await prisma.Configuracion_Tecnica.findUnique({
      where: { id_usuario: parseInt(id_usuario) },
      include: {
        usuario: {
          select: {
            nombre_usuario: true,
            correo_contacto: true,
          },
        },
      },
    });

    if (!config) {
      return res.status(404).json({ error: "Configuración no encontrada" });
    }

    const numeraciones = (config.numeraciones || []).map((n) => ({
      ...n,
      numero_actual:
        n.numero_actual !== undefined && n.numero_actual !== null
          ? n.numero_actual
          : (n.numero_inicial || 1) - 1,
    }));

    res.json({
      configuracion: config,
      numeraciones,
      usuario: config.usuario,
    });
  } catch (error) {
    console.error("Error al obtener configuración completa:", error);
    res.status(500).json({ error: error.message });
  }
});


// === Añadir o actualizar rango de numeración (global) ===
router.post("/numeracion/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { tipo_documento, numero_inicial, numero_final, resolucion, fecha_resolucion } = req.body;

    // Prefijo automático según tipo de documento
    const prefijo =
      tipo_documento === "Factura"
        ? "FE"
        : tipo_documento === "Nota Crédito"
        ? "NC"
        : tipo_documento === "Nota Débito"
        ? "ND"
        : "GEN";

    const config = await prisma.Configuracion_Tecnica.findUnique({
      where: { id_usuario: parseInt(id_usuario) },
    });

    if (!config) return res.status(404).json({ error: "Configuración no encontrada" });

    let numeraciones = Array.isArray(config.numeraciones)
      ? [...config.numeraciones]
      : [];

    // El rango es global, se actualiza el único rango existente
    let numeracionGlobal = numeraciones[0] || {
      id: Date.now(),
      tipo_documento: "Global",
      prefijo: "GEN",
      numero_inicial: 1,
      numero_final: 9999,
      resolucion: null,
      fecha_resolucion: new Date(),
      estado: "Activo",
      numero_actual: 0,
    };

    numeracionGlobal = {
      ...numeracionGlobal,
      tipo_documento,
      prefijo,
      numero_inicial: parseInt(numero_inicial),
      numero_final: parseInt(numero_final),
      resolucion,
      fecha_resolucion,
      estado: "Activo",
      numero_actual:
        numeracionGlobal.numero_actual || parseInt(numero_inicial) - 1,
    };

    numeraciones = [numeracionGlobal];

    const updated = await prisma.Configuracion_Tecnica.update({
      where: { id_usuario: parseInt(id_usuario) },
      data: { numeraciones },
    });

    res.json({
      mensaje: "Rango global actualizado correctamente",
      numeraciones: updated.numeraciones,
    });
  } catch (error) {
    console.error("Error al actualizar rango global:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/rango-global/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { numero_inicial, numero_final } = req.body;

    const config = await prisma.Configuracion_Tecnica.findUnique({
      where: { id_usuario: parseInt(id_usuario) },
    });

    if (!config)
      return res.status(404).json({ error: "Configuración no encontrada" });

    let numeraciones = Array.isArray(config.numeraciones)
      ? [...config.numeraciones]
      : [];

    const fechaActual = new Date();

    // Actualizar o crear rango global
    numeraciones = numeraciones.map((n) => ({
      ...n,
      numero_inicial: parseInt(numero_inicial),
      numero_final: parseInt(numero_final),
      fecha_resolucion: fechaActual,
      estado: "Activo",
      numero_actual: n.numero_actual ?? parseInt(numero_inicial) - 1,
    }));

    if (numeraciones.length === 0) {
      numeraciones.push({
        id: Date.now(),
        tipo_documento: "Global",
        prefijo: "",
        numero_inicial: parseInt(numero_inicial),
        numero_final: parseInt(numero_final),
        resolucion: null,
        fecha_resolucion: fechaActual,
        estado: "Activo",
        numero_actual: parseInt(numero_inicial) - 1,
      });
    }

    const updated = await prisma.Configuracion_Tecnica.update({
      where: { id_usuario: parseInt(id_usuario) },
      data: { numeraciones },
    });

    res.json({
      mensaje: "Rango global actualizado correctamente",
      numeraciones: updated.numeraciones,
    });
  } catch (error) {
    console.error("Error al actualizar rango global:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/regenerar-certificado/:id_usuario", upload.single("certificado_firma"), async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { fecha_expiracion } = req.body;

    if (!req.file) return res.status(400).json({ error: "Debe adjuntar el nuevo certificado" });
    if (!fecha_expiracion) return res.status(400).json({ error: "Debe indicar la nueva fecha de expiración" });

    const certificadoPath = req.file.path;

    const config = await prisma.Configuracion_Tecnica.update({
      where: { id_usuario: parseInt(id_usuario) },
      data: {
        certificado_firma: certificadoPath,
        fecha_expiracion: new Date(fecha_expiracion),
      },
    });

    res.json({
  mensaje: "Certificado actualizado correctamente",
  certificado: config.certificado_firma,
  fecha_expiracion: config.fecha_expiracion,
});
  } catch (error) {
    console.error("Error al regenerar certificado:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
