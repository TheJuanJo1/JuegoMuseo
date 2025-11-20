import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Registrar un cliente
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
    const clienteExistente = await prisma.clientes.findFirst({
      where: {
        OR: [
          // Documento repetido sin importar tipo
          { numero_documento: numero_documento },

          // Correo repetido
          correo_cliente ? { correo_cliente } : undefined,

          // Dirección repetida
          direccion_cliente ? { direccion_cliente } : undefined,

          // Nombre + Apellido repetido
          {
            nombre_cliente,
            apellido_cliente
          }
        ].filter(Boolean), // elimina undefined del OR
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
        id_usuario: null // No vinculamos usuario
      },
    });

    res.status(201).json({ message: "Cliente registrado", cliente: nuevoCliente });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error al registrar cliente" });
  }
});

export default router;

