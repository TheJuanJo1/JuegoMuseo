import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";

const router = Router();

// Últimos documentos del usuario autenticado
router.get("/", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Convertir payload.sub a entero
    const userId = parseInt(payload.sub, 10);
    if (isNaN(userId)) return res.status(400).json({ error: "ID de usuario inválido" });

    // Traer los últimos 20 documentos ordenados por fecha
    const docs = await prisma.documentos_XML.findMany({
      where: { id_usuario: userId },
      orderBy: { fecha_emision: "desc" },
      take: 20,
      select: {
        id_documento: true,
        tipo_documento: true,
        numero_documento: true,
        numero_serie: true,
        prefijo: true,
        consecutivo_completo: true,
        fecha_emision: true,
        subtotal: true,
        descuentos: true,
        valor_total: true,
        impuestos: true,
        moneda: true,
        forma_pago: true,
        metodo_pago: true,
        cufe: true,
        cude: true,
        xml_archivo: true,
        pdf_archivo: true,
        id_cliente: true,
        Clientes: {
          select: {
            nombre_completo: true,
            razon_social: true,
            correo_cliente: true,
          },
        },
        DocumentoPadre: {
          select: {
            id_documento: true,
            tipo_documento: true,
            numero_documento: true,
          },
        },
        NotasRelacionadas: {
          select: {
            id_documento: true,
            tipo_documento: true,
            numero_documento: true,
          },
        },
      },
    });

    res.json(docs);
  } catch (err) {
    console.error("Error en /ultimos:", err);
    res.status(500).json({ error: "Error al cargar últimos documentos" });
  }
});

export default router;
