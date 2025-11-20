import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();

// Configuración de carpeta para firmas
const firmasDir = path.join(process.cwd(), "uploads", "firmas");
if (!fs.existsSync(firmasDir)) fs.mkdirSync(firmasDir, { recursive: true });

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

// === Guardar o actualizar configuración ===
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
      numero_inicial,
      numero_final,
      prefijo_numeracion,
    } = req.body;
    const direccionExiste = await prisma.Configuracion_Tecnica.findFirst({
      where: {
        direccion_empresa, NOT: { id_usuario: parseInt(id_usuario) }
      }
    });
    if (direccionExiste) {
      return res.status(400).json({
        error: "La dirección ingresada ya está registrada por otra empresa."
      });
    }
    const expDate = new Date(fecha_expiracion);
    if (expDate <= new Date())
      return res.status(400).json({ error: "La fecha de expiración debe ser futura" });

    const certificadoPath = req.file ? req.file.path : null;

    let config = await prisma.Configuracion_Tecnica.findUnique({
      where: { id_usuario: parseInt(id_usuario) },
    });

    // Parsear numeraciones si vienen
    let numeracionesParseadas = [];
    try {
      numeracionesParseadas = numeraciones ? JSON.parse(numeraciones) : [];
    } catch {
      numeracionesParseadas = [];
    }

    // Si no hay configuración y no vienen numeraciones, crear solo rango Factura
    if (!config && numeracionesParseadas.length === 0) {
  
  const inicial = parseInt(numero_inicial) || 1;
  const final = parseInt(numero_final) || inicial + 9999;

  numeracionesParseadas = [
    {
      id: Date.now() + 1,
      tipo_documento: "Factura",
      prefijo: "FE",
      numero_inicial: inicial,
      numero_final: final,
      numero_actual: inicial - 1,
      resolucion: "Automática",
      fecha_resolucion: new Date(),
      estado: "Activo",
    },
    {
      id: Date.now() + 2,
      tipo_documento: "Nota Crédito",
      prefijo: "NC",
      numero_inicial: inicial,
      numero_final: final,
      numero_actual: inicial - 1,
      resolucion: "Automática",
      fecha_resolucion: new Date(),
      estado: "Activo",
    },
    {
      id: Date.now() + 3,
      tipo_documento: "Nota Débito",
      prefijo: "ND",
      numero_inicial: inicial,
      numero_final: final,
      numero_actual: inicial - 1,
      resolucion: "Automática",
      fecha_resolucion: new Date(),
      estado: "Activo",
    },
  ];
}

    // Asegurar numero_actual consistente
    numeracionesParseadas = numeracionesParseadas.map(n => ({
      ...n,
      numero_actual: n.numero_actual !== undefined && n.numero_actual !== null
        ? n.numero_actual
        : (n.numero_inicial || 1) - 1,
    }));

    if (config) {
      // Actualizar configuración existente: solo actualizar Factura
      let numeracionesFinales = config.numeraciones || [];
      const indexFactura = numeracionesFinales.findIndex(n => n.tipo_documento === "Factura");

      if (indexFactura >= 0) {
        numeracionesFinales[indexFactura] = numeracionesParseadas[0];
      } else {
        numeracionesFinales.push(numeracionesParseadas[0]);
      }

      config = await prisma.Configuracion_Tecnica.update({
        where: { id_usuario: parseInt(id_usuario) },
        data: {
          direccion_empresa,
          regimen_tributario,
          contrasena_cert,
          token_api,
          fecha_expiracion: expDate,
          certificado_firma: certificadoPath || config.certificado_firma,
          numeraciones: numeracionesFinales,
        },
      });
    } else {
      // Crear nueva configuración
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

// === Estado de configuración ===
router.get("/estado/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const config = await prisma.Configuracion_Tecnica.findUnique({ where: { id_usuario: parseInt(id_usuario) } });
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
      include: { usuario: { select: { nombre_usuario: true, correo_contacto: true, nit_empresa: true } } },
    });

    if (!config) return res.status(404).json({ error: "Configuración no encontrada" });

    const numeraciones = (config.numeraciones || []).map((n) => ({
      ...n,
      numero_actual: n.numero_actual !== undefined && n.numero_actual !== null ? n.numero_actual : (n.numero_inicial || 1) - 1,
    }));

    res.json({ configuracion: config, numeraciones, usuario: config.usuario });
  } catch (error) {
    console.error("Error al obtener configuración completa:", error);
    res.status(500).json({ error: error.message });
  }
});

// === Crear o actualizar numeración ===
router.post("/numeracion/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { tipo_documento, numero_inicial, numero_final, resolucion, fecha_resolucion } = req.body;

    if (parseInt(numero_inicial) > parseInt(numero_final))
      return res.status(400).json({ error: "El número inicial no puede ser mayor al número final" });

    const prefijo = tipo_documento === "Factura" ? "FE"
      : tipo_documento === "Nota Crédito" ? "NC"
      : tipo_documento === "Nota Débito" ? "ND"
      : "GEN";

    const config = await prisma.Configuracion_Tecnica.findUnique({ where: { id_usuario: parseInt(id_usuario) } });
    if (!config) return res.status(404).json({ error: "Configuración no encontrada" });

    let numeraciones = Array.isArray(config.numeraciones) ? [...config.numeraciones] : [];
    let numeracionExistente = numeraciones.find(n => n.tipo_documento === tipo_documento);

if (numeracionExistente) {
  // No resetear numero_actual si ya está dentro del nuevo rango
  let numeroActual = numeracionExistente.numero_actual;
  if (numeroActual < parseInt(numero_inicial) - 1) numeroActual = parseInt(numero_inicial) - 1;
  if (numeroActual > parseInt(numero_final)) numeroActual = parseInt(numero_final); // En caso de reducir rango

  numeracionExistente = {
    ...numeracionExistente,
    numero_inicial: parseInt(numero_inicial),
    numero_final: parseInt(numero_final),
    resolucion,
    fecha_resolucion,
    prefijo,
    estado: numeroActual >= parseInt(numero_final) ? "Inactivo" : "Activo",
    numero_actual: numeroActual,
  };
  numeraciones = numeraciones.map(n => n.tipo_documento === tipo_documento ? numeracionExistente : n);
}
     else {
      numeraciones.push({
        id: Date.now(),
        tipo_documento,
        prefijo,
        numero_inicial: parseInt(numero_inicial),
        numero_final: parseInt(numero_final),
        resolucion,
        fecha_resolucion,
        estado: "Activo",
        numero_actual: parseInt(numero_inicial) - 1,
      });
    }

    const updated = await prisma.Configuracion_Tecnica.update({
      where: { id_usuario: parseInt(id_usuario) },
      data: { numeraciones },
    });

    res.json({ mensaje: `Rango de ${tipo_documento} actualizado correctamente`, numeraciones: updated.numeraciones });
  } catch (error) {
    console.error("Error al actualizar numeración:", error);
    res.status(500).json({ error: error.message });
  }
});

// === Regenerar certificado ===
router.post("/regenerar-certificado/:id_usuario", upload.single("certificado_firma"), async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { fecha_expiracion } = req.body;

    if (!req.file) return res.status(400).json({ error: "Debe adjuntar el nuevo certificado" });
    if (!fecha_expiracion) return res.status(400).json({ error: "Debe indicar la nueva fecha de expiración" });

    const certificadoPath = req.file.path;

    const config = await prisma.Configuracion_Tecnica.update({
      where: { id_usuario: parseInt(id_usuario) },
      data: { certificado_firma: certificadoPath, fecha_expiracion: new Date(fecha_expiracion) },
    });

    res.json({ mensaje: "Certificado actualizado correctamente", certificado: config.certificado_firma, fecha_expiracion: config.fecha_expiracion });
  } catch (error) {
    console.error("Error al regenerar certificado:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
