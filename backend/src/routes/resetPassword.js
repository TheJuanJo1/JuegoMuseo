import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();
router.post("/", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token y contraseña requeridos" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.Usuarios.update({
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

