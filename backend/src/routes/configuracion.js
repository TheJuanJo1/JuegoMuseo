import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();

// Carpeta para certificados
const firmasDir = path.join(process.cwd(), "uploads", "firmas");
if (!fs.existsSync(firmasDir)) fs.mkdirSync(firmasDir, { recursive: true });

// Configuración multer
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
    } = req.body;

    // Verificar si la dirección ya existe
    const direccionExiste = await prisma.Configuracion_Tecnica.findFirst({
      where: {
        direccion_empresa,
        NOT: { id_usuario: parseInt(id_usuario) },
      },
    });

    if (direccionExiste)
      return res.status(400).json({ error: "La dirección ingresada ya está registrada por otra empresa." });

    const expDate = new Date(fecha_expiracion);
    if (expDate <= new Date())
      return res.status(400).json({ error: "La fecha de expiración debe ser futura" });

    const certificadoPath = req.file ? req.file.path : null;

    // Parsear numeraciones
    let numeracionesParseadas = [];
    try {
      numeracionesParseadas = numeraciones ? JSON.parse(numeraciones) : [];
    } catch (err) {
      return res.status(400).json({ error: "Numeraciones inválidas" });
    }

    if (!numeracionesParseadas.length) {
      return res.status(400).json({ error: "Debe enviar numeraciones válidas desde el formulario" });
    }
    

    // Asegurar números válidos
    numeracionesParseadas = numeracionesParseadas.map(n => ({
  tipo_documento: n.tipo_documento,
  prefijo: n.prefijo || (n.tipo_documento === "Factura" ? "FE" : n.tipo_documento === "Nota Crédito" ? "NC" : "ND"),
  numero_inicial: Number(n.inicio),
  numero_final: Number(n.fin),
  numero_actual: Number(n.inicio) - 1,
  resolucion: n.resolucion || "Automática",
  fecha_resolucion: n.fecha_resolucion ? new Date(n.fecha_resolucion) : new Date(),
  estado: n.estado || "Activo",
}));


    // Buscar configuración existente
    let config = await prisma.Configuracion_Tecnica.findUnique({
      where: { id_usuario: parseInt(id_usuario) },
    });

    if (config) {
      // Actualizar configuración existente y rangos
      let numeracionesFinales = config.numeraciones || [];

      numeracionesParseadas.forEach((nuevaNum) => {
        const index = numeracionesFinales.findIndex(n => n.tipo_documento === nuevaNum.tipo_documento);
        if (index >= 0) numeracionesFinales[index] = nuevaNum;
        else numeracionesFinales.push(nuevaNum);
      });

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

      // Actualizar tabla de rangos individualmente
      for (const n of numeracionesParseadas) {
        const tipo = n.tipo_documento === "Factura" ? "FACTURA" :
                     n.tipo_documento === "Nota Crédito" ? "NC" : "ND";

        await prisma.rangos.upsert({
          where: { id_usuario_tipo: { id_usuario: Number(id_usuario), tipo } },
          update: {
            inicio: n.numero_inicial,
            fin: n.numero_final,
            resolucion: n.resolucion,
            fecha_desde: n.fecha_resolucion,
          },
          create: {
            tipo,
            prefijo: n.prefijo,
            inicio: n.numero_inicial,
            fin: n.numero_final,
            resolucion: n.resolucion,
            fecha_desde: n.fecha_resolucion,
            estado: "Activo",
            id_usuario: Number(id_usuario),
          },
        });
      }

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

      // Guardar rangos en tabla separada
      for (const n of numeracionesParseadas) {
        const tipo = n.tipo_documento === "Factura" ? "FACTURA" :
                     n.tipo_documento === "Nota Crédito" ? "NC" : "ND";

        await prisma.rangos.create({
          data: {
            tipo,
            prefijo: n.prefijo,
            inicio: n.numero_inicial,
            fin: n.numero_final,
            resolucion: n.resolucion,
            fecha_desde: n.fecha_resolucion,
            estado: "Activo",
            id_usuario: parseInt(id_usuario),
          },
        });
      }
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
      where: { id_usuario: Number(id_usuario) },
      include: {
        usuario: { select: { nombre_usuario: true, correo_contacto: true, nit_empresa: true } },
      },
    });
    if (!config) return res.status(404).json({ error: "Configuración no encontrada" });

    const rangos = await prisma.rangos.findMany({
      where: { id_usuario: Number(id_usuario) },
      orderBy: { id: "desc" },
    });

    res.json({ configuracion: config, numeraciones: rangos, usuario: config.usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// === Guardar/Actualizar numeración individual ===
router.post("/numeracion/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { tipo_documento, numero_inicial, numero_final, resolucion, fecha_resolucion } = req.body;

    const tipo = tipo_documento === "Factura" ? "FACTURA" :
                 tipo_documento === "Nota Crédito" ? "NC" : "ND";

    const upsertRango = await prisma.rangos.upsert({
      where: { id_usuario_tipo: { id_usuario: Number(usuarioId), tipo } }, // ⚡ índice compuesto necesario
      update: {
        inicio: Number(numero_inicial),
        fin: Number(numero_final),
        resolucion,
        fecha_desde: new Date(fecha_resolucion),
      },
      create: {
        tipo,
        prefijo: tipo === "FACTURA" ? "FE" : tipo === "NC" ? "NC" : "ND",
        inicio: Number(numero_inicial),
        fin: Number(numero_final),
        resolucion,
        fecha_desde: new Date(fecha_resolucion),
        id_usuario: Number(usuarioId),
      },
    });

    const lista = await prisma.rangos.findMany({
      where: { id_usuario: Number(usuarioId) },
      orderBy: { id: "desc" },
    });

    res.json({ numeraciones: lista });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar numeración" });
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
      data: { certificado_firma: certificadoPath, fecha_expiracion: new Date(fecha_expiracion) },
    });

    res.json({ mensaje: "Certificado actualizado correctamente", certificado: config.certificado_firma, fecha_expiracion: config.fecha_expiracion });
  } catch (error) {
    console.error("Error al regenerar certificado:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
