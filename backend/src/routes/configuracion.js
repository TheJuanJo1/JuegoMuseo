// src/routes/configuracion.js
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();

// Carpeta para subir certificados
const firmasDir = path.join(process.cwd(), "uploads", "firmas");
if (!fs.existsSync(firmasDir)) {
  fs.mkdirSync(firmasDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, firmasDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "_" + file.originalname),
});

const fileFilter = (req, file, cb) => {
  const allowed = [".p12", ".cer"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Formato no válido (.p12, .cer)"), false);
};

const upload = multer({ storage, fileFilter });

// -------------------- RUTA POST: guardar configuración --------------------
router.post("/", upload.single("certificado_firma"), async (req, res) => {
  try {
    const {
      direccion_empresa,
      regimen_tributario,
      contrasena_cert,
      token_api,
      fecha_expiracion,
      id_usuario,
      numeraciones, // Array JSON enviado desde frontend
    } = req.body;

    // Validar fecha
    const expDate = new Date(fecha_expiracion);
    if (expDate <= new Date()) {
      return res.status(400).json({
        error: "La fecha de expiración de la firma debe ser mayor a la fecha actual",
      });
    }

    const certificadoPath = req.file ? req.file.path : null;

    // Crear o actualizar configuración
    const existing = await prisma.Configuracion_Tecnica.findUnique({
      where: { id_usuario: parseInt(id_usuario) },
    });

    let config;
    if (existing) {
      config = await prisma.Configuracion_Tecnica.update({
        where: { id_usuario: parseInt(id_usuario) },
        data: {
          direccion_empresa,
          regimen_tributario,
          contrasena_cert,
          token_api,
          fecha_expiracion: expDate,
          certificado_firma: certificadoPath || existing.certificado_firma,
          numeraciones: numeraciones ? JSON.parse(numeraciones) : existing.numeraciones,
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
          numeraciones: numeraciones ? JSON.parse(numeraciones) : [],
        },
      });
    }

    res.json({ mensaje: "Configuración guardada con éxito", config });
  } catch (error) {
    console.error("Error al guardar configuración:", error);
    res.status(500).json({ error: error.message });
  }
});

// -------------------- RUTA GET: estado de configuración --------------------
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

// -------------------- RUTA GET: configuración completa --------------------
router.get("/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const config = await prisma.Configuracion_Tecnica.findUnique({
      where: { id_usuario: parseInt(id_usuario) },
    });

    if (!config) {
      return res.status(404).json({ error: "Configuración no encontrada" });
    }

    res.json({
      configuracion: config,
      numeraciones: config.numeraciones || [],
    });
  } catch (error) {
    console.error("Error al obtener configuración completa:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
