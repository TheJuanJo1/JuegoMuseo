// backend/src/routes/filtrar.js
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const { desde, hasta, tipo, estado, cliente } = req.body;

    const filtros = {
      id_usuario: payload.sub
    };

    // filtros básicos
    if (desde && hasta)
      filtros.fecha_emision = {
        gte: new Date(desde),
        lte: new Date(hasta)
      };

    if (tipo)
      filtros.tipo_documento = {
        contains: tipo,
        mode: "insensitive"
      };

    if (estado)
      filtros.estado_dian = estado;

    // FILTRO DE CLIENTE (CORRECTO SEGÚN TU MODELO)
    let whereCliente = {};

    if (cliente) {
      const idNum = Number(cliente);

      whereCliente = {
        OR: [
          // si escribe un número, busca por ID
          ...(isNaN(idNum) ? [] : [{ id_cliente: idNum }]),

          // número del documento (NIT/CC)
          { numero_documento: { contains: cliente, mode: "insensitive" } },

          // nombre completo
          { nombre_completo: { contains: cliente, mode: "insensitive" } },

          // razón social
          { razon_social: { contains: cliente, mode: "insensitive" } },

          // correo
          { correo_cliente: { contains: cliente, mode: "insensitive" } },

          // ciudad
          { ciudad: { contains: cliente, mode: "insensitive" } },

          // departamento
          { departamento: { contains: cliente, mode: "insensitive" } }
        ]
      };
    }

    const docsFiltrados = await prisma.documentos_XML.findMany({
      where: {
        ...filtros,
        ...(cliente ? { Clientes: whereCliente } : {})
      },
      include: {
        Clientes: true,
        Producto_Factura: true,
        Usuarios: true
      },
      orderBy: { numero_factura: "desc" },

    });

    res.json(docsFiltrados);

  } catch (err) {
    console.error("Error en /filtrar:", err);
    res.status(500).json({ error: "Error al filtrar documentos" });
  }
});

export default router;
