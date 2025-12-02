// routes/resetPassword.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// POST /api/reset-password
router.post("/", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token y contraseña requeridos" });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar contraseña en la base de datos
    await prisma.usuarios.update({
      where: { id_usuario: decoded.id },
      data: { contrasena_usuario: hashedPassword },
    });

    res.json({ msg: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error en reset-password:", err);
    res.status(400).json({ error: "Token inválido o expirado" });
  }
});

export default router;