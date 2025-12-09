import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, nombre_usuario, tipo, resultado } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    // Filtro por tipo de documento (en registros)
    if (tipo) {
      where.tipo_documento = {
        contains: tipo,
        mode: "insensitive",
      };
    }

    // Filtro por resultado (en registros)
    if (resultado) {
      where.resultado = {
        contains: resultado,
        mode: "insensitive",
      };
    }

    // --- Filtro por nombre_usuario PERO en la relación Usuarios ---
    if (nombre_usuario) {
      where.Usuarios = {
        nombre_usuario: {
          contains: nombre_usuario,
          mode: "insensitive",
        },
      };
    }

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
