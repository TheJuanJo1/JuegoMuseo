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

    // Traer los últimos 20 documentos ordenados por fecha
    const docs = await prisma.Documentos_XML.findMany({
      where: { id_usuario: payload.sub },
      orderBy: { fecha_emision: "desc" },
      take: 20,
      select: {
        id_documento: true,
        tipo_documento: true,
        numero_documento: true, // 👈 importante para la tabla
        valor_total: true,      // 👈 importante para gráficas
        cufe: true,
        cude: true,
        estado_dian: true,
        fecha_emision: true,
      },
    });

    res.json(docs);
  } catch (err) {
    console.error("Error en /ultimos:", err);
    res.status(500).json({ error: "Error al cargar últimos documentos" });
  }
});
export default router