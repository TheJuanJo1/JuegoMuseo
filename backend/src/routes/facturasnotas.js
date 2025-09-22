import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const router = Router();

// Función para generar CUFE / CUDE simulados
function generarCodigo(tipo, numero, fecha) {
  const base = `${tipo}-${numero}-${fecha}-${Date.now()}`;
  return crypto.createHash("sha256").update(base).digest("hex").slice(0, 44);
}

// Registrar facturas o notas
router.post("/enviar", async (req, res) => {
  try {
    const {
      tipo_documento,
      numero_documento,
      fecha_emision,
      valor_total,
      impuestos,
      id_usuario,
    } = req.body;

    console.log("Datos recibidos:", req.body);

    if (!tipo_documento || !numero_documento || !fecha_emision || !valor_total || !id_usuario) {
      return res.status(400).json({ 
        error: "Faltan campos obligatorios",
        campos_recibidos: req.body 
      });
    }

    const usuarioId = parseInt(id_usuario);
    if (isNaN(usuarioId) || usuarioId <= 0) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { id_usuario: usuarioId }
    });

    if (!usuarioExistente) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // -----------------------
    // VALIDACIONES "DIAN"
    // -----------------------
    let estado_dian = "Aceptado";
    let mensaje_dian = "Documento validado y aceptado en la DIAN.";

    const fechaHoy = new Date();
    const fechaDoc = new Date(fecha_emision);

    // 1. Fecha futura
    if (fechaDoc > fechaHoy) {
      estado_dian = "Rechazado";
      mensaje_dian = "Documento rechazado: fecha de emisión no puede ser futura.";
    }

    // 2. Valor total inválido
    else if (parseFloat(valor_total) <= 0) {
      estado_dian = "Rechazado";
      mensaje_dian = "Documento rechazado: valor total inválido.";
    }

    // 3. Documento duplicado
    else {
      const existente = await prisma.documentos_XML.findFirst({
        where: { numero_documento, id_usuario: usuarioId }
      });
      if (existente) {
        estado_dian = "Rechazado";
        mensaje_dian = "Documento rechazado: número de documento ya registrado.";
      }
    }

    // 4. Validación de impuestos (si no se manda, queda pendiente)
    if (estado_dian === "Aceptado") {
      if (!impuestos) {
        estado_dian = "Pendiente";
        mensaje_dian = "Documento en proceso: falta validación de impuestos.";
      } else {
        const base = parseFloat(valor_total) - parseFloat(impuestos);
        if (base < 0) {
          estado_dian = "Rechazado";
          mensaje_dian = "Documento rechazado: impuestos mayores al valor total.";
        }
      }
    }

    // -----------------------
    // GENERAR CÓDIGO CUFE/CUDE
    // -----------------------
    const codigo = tipo_documento === "Factura"
      ? generarCodigo("CUFE", numero_documento, fecha_emision)
      : generarCodigo("CUDE", numero_documento, fecha_emision);

    // Guardar en BD
    const documento = await prisma.documentos_XML.create({
      data: {
        tipo_documento,
        numero_documento,
        fecha_emision: fechaDoc,
        valor_total: parseFloat(valor_total),
        impuestos: parseFloat(impuestos) || 0,
        estado_dian,
        codigo_dian: codigo,
        mensaje_dian,
        fecha_respuesta_dian: new Date(),
        cufe: tipo_documento === "Factura" ? codigo : null,
        cude: tipo_documento !== "Factura" ? codigo : null,
        xml_archivo: "<xml>simulado</xml>",
        pdf_archivo: Buffer.from("PDF simulado"),
        Usuarios: {
          connect: { id_usuario: usuarioId }
        }
      },
    });

    res.json({
      message: "Documento procesado exitosamente",
      documento,
      usuario_asociado: {
        id: usuarioExistente.id_usuario,
        nombre: usuarioExistente.nombre_usuario
      }
    });

  } catch (err) {
    console.error("Error detallado:", err);
    res.status(500).json({ error: "Error procesando documento" });
  }
});

//Estadísticas por estado
router.get("/ultimos", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const ultimos = await prisma.documentos_XML.findMany({
      where: { id_usuario: payload.sub },
      orderBy: { fecha_emision: "desc" },
      take: 10
    });

    res.json(ultimos);
  } catch (err) {
    console.error("Error al obtener últimos documentos:", err);
    res.status(500).json({ error: "Error obteniendo documentos" });
  }
});

router.get("/estadisticas", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Agrupar por estado
    const counts = await prisma.documentos_XML.groupBy({
      by: ["estado_dian"],
      where: { id_usuario: payload.sub },
      _count: { estado_dian: true },
    });

    // Inicializar resultados
    const result = { Aceptado: 0, Rechazado: 0, Pendiente: 0 };
    counts.forEach((c) => {
      result[c.estado_dian] = c._count.estado_dian;
    });

    res.json(result);
  } catch (err) {
    console.error("Error al obtener estadísticas:", err);
    res.status(500).json({ error: "Error obteniendo estadísticas" });
  }
});
// Historial completo
router.get("/historial", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const historial = await prisma.documentos_XML.findMany({
      where: { id_usuario: payload.sub },
      orderBy: { fecha_emision: "desc" },
    });

    res.json(historial);
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

export default router;
