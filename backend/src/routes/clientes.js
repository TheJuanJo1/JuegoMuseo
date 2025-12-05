import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// --------------------------------------------------------
// POST — Registrar un cliente
// --------------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const {
      nombre_cliente,
      apellido_cliente,
      tipo_documento,
      numero_documento,
      direccion_cliente,
      correo_cliente
    } = req.body;

    // Validar campos obligatorios
    if (!nombre_cliente || !apellido_cliente || !tipo_documento || !numero_documento) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Validar duplicados
    const clienteExistente = await prisma.clientes.findFirst({
      where: {
        OR: [
          { numero_documento },                   // Documento repetido
          correo_cliente ? { correo_cliente } : undefined, // Correo repetido
          direccion_cliente ? { direccion_cliente } : undefined, // Dirección repetida
          { nombre_cliente, apellido_cliente }     // Nombre + Apellido repetido
        ].filter(Boolean)
      }
    });

    if (clienteExistente) {
      return res.status(409).json({
        error: "Ya existe un cliente con datos similares."
      });
    }

    // Crear cliente
    const nuevoCliente = await prisma.clientes.create({
      data: {
        nombre_cliente,
        apellido_cliente,
        tipo_documento,
        numero_documento,
        direccion_cliente,
        correo_cliente,
        id_usuario: null // No vinculado a empresa o usuario
      },
    });

    res.status(201).json({ message: "Cliente registrado", cliente: nuevoCliente });

  } catch (error) {
    console.error("Error en POST /clientes/register:", error);
    res.status(500).json({ error: error.message || "Error al registrar cliente" });
  }
});

// --------------------------------------------------------
// GET — Listar todos los clientes
// --------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const clientes = await prisma.clientes.findMany({
      orderBy: { id_cliente: "desc" }
    });

    res.json({
      total: clientes.length,
      clientes
    });

  } catch (error) {
    console.error("Error en GET /clientes:", error);
    res.status(500).json({ error: "Error obteniendo clientes" });
  }
});

export default router;
