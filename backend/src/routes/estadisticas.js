import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = parseInt(payload.sub, 10);
    if (isNaN(userId)) return res.status(400).json({ error: "ID de usuario inválido" });

    // Traer todos los documentos con su último evento
    const docs = await prisma.documentos_XML.findMany({
      where: { id_usuario: userId },
      select: {
        id_documento: true,
        tipo_documento: true,
        Eventos: {
          orderBy: { fecha_hora: "desc" },
          take: 1,
          select: { resultado: true },
        },
      },
    });

    let Aceptado = 0, Rechazado = 0, Pendiente = 0;
    let Factura = 0, NotaCredito = 0, NotaDebito = 0;

    docs.forEach((doc) => {
      // Estado basado en último evento
      if (doc.Eventos.length === 0) Pendiente++;
      else {
        const resEvt = doc.Eventos[0].resultado.toLowerCase();
        if (resEvt.includes("aceptado")) Aceptado++;
        else if (resEvt.includes("rechazado") || resEvt.includes("error")) Rechazado++;
        else Pendiente++;
      }

      // Contar por tipo de documento
      const tipo = doc.tipo_documento.toLowerCase();
      if (tipo.includes("factura")) Factura++;
      else if (tipo.includes("credito")) NotaCredito++;
      else if (tipo.includes("debito")) NotaDebito++;
    });

    const total = Factura + NotaCredito + NotaDebito;

    res.json({
      Aceptado,
      Rechazado,
      Pendiente,
      tipos: {
        Factura,
        "Nota Crédito": NotaCredito,
        "Nota Débito": NotaDebito,
      },
      total,
    });
  } catch (err) {
    console.error("Error en /estadisticas:", err);
    res.status(500).json({ error: "Error al cargar estadísticas" });
  }
});

export default router;
