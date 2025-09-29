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

const filtros = { id_usuario: payload.sub };

// filtros básicos
if (desde && hasta) filtros.fecha_emision = { gte: new Date(desde), lte: new Date(hasta) };
if (tipo) filtros.tipo_documento = { contains: tipo, mode: "insensitive" };
if (estado) filtros.estado_dian = estado;

// filtro por cliente
let whereCliente = {};
if (cliente) {
  const idNum = Number(cliente);
  whereCliente = {
    OR: [
      { id_cliente: isNaN(idNum) ? undefined : idNum }, // busca por ID si es numérico
      { nombre_cliente: { contains: cliente, mode: "insensitive" } },
      { apellido_cliente: { contains: cliente, mode: "insensitive" } }
    ]
  };
}
const docsFiltrados = await prisma.Documentos_XML.findMany({
  where: {
    ...filtros,
    ...(cliente ? { Clientes: whereCliente } : {}),
  },
  include: {
    Clientes: true,
    Producto_Factura: true,
    Usuarios: true,
  },
  orderBy: { fecha_emision: "desc" },
});

    res.json(docsFiltrados);
  } catch (err) {
    console.error("Error en /filtrar:", err);
    res.status(500).json({ error: "Error al filtrar documentos" });
  }
});

export default router;

