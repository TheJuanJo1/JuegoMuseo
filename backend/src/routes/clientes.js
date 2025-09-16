import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Ruta para registrar un cliente
router.post("/register", async (req, res) => {
  console.log("Body recibido:", req.body);
  try {
    const {
      nombre_cliente,
      apellido_cliente,
      tipo_documento,
      numero_documento,
      direccion_cliente,
      correo_cliente,
      id_usuario
    } = req.body;

    // Guardar cliente en la BD
    const nuevoCliente = await prisma.clientes.create({
      data: {
        nombre_cliente,
        apellido_cliente,
        tipo_documento,
        numero_documento,
        direccion_cliente,
        correo_cliente,
        id_usuario
      }
    });

    res.status(201).json({ message: "Cliente registrado", cliente: nuevoCliente });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar cliente", error });
  }
});

export default router;
