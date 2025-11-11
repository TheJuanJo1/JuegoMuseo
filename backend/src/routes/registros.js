import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, empresa, tipo, resultado } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    //Filtros dinámicos
    const where = {};
    if (empresa) where.empresa = { contains: empresa, mode: "insensitive" };
    if (tipo) where.tipo_documento = { equals: tipo };
    if (resultado) where.resultado = { equals: resultado };

    //Consultar registros con paginación
    const registros = await prisma.Registros_Sistema.findMany({
      where,
      orderBy: { fecha_hora: "desc" },
      skip,
      take,
      include: {
        Usuarios: {
          select: { nombre_usuario: true, rol_usuario: true },
        },
      },
    });

    //Total de registros para calcular páginas
    const total = await prisma.Registros_Sistema.count({ where });
    const totalPages = Math.ceil(total / take);

    res.json({
      registros,
      pagina_actual: parseInt(page),
      total_paginas: totalPages,
      total_registros: total,
    });
  } catch (err) {
    console.error("Error al obtener registros:", err);
    res.status(500).json({ error: "Error al obtener registros" });
  }
});

export default router;
