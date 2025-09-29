import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Contar por estado
    const estados = await prisma.documentos_XML.groupBy({
      by: ["estado_dian"],
      _count: { estado_dian: true },
      where: { id_usuario: payload.sub },
    });

    // Inicializar en 0
    let Aceptado = 0,
      Rechazado = 0,
      Pendiente = 0;

    estados.forEach((e) => {
      const estado = e.estado_dian.toLowerCase();
      if (estado === "aceptado") Aceptado = e._count.estado_dian;
      if (estado === "rechazado") Rechazado = e._count.estado_dian;
      if (estado === "pendiente") Pendiente = e._count.estado_dian;
    });

    // Contar por tipo
    const tipos = await prisma.documentos_XML.groupBy({
      by: ["tipo_documento"],
      _count: { tipo_documento: true },
      where: { id_usuario: payload.sub },
    });

    let Factura = 0,
      NotaCredito = 0,
      NotaDebito = 0;

    tipos.forEach((t) => {
      const tipo = t.tipo_documento.toLowerCase();
      if (tipo.includes("factura")) Factura = t._count.tipo_documento;
      if (tipo.includes("credito")) NotaCredito = t._count.tipo_documento;
      if (tipo.includes("debito")) NotaDebito = t._count.tipo_documento;
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
