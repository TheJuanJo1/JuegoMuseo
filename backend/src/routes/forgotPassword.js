import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.usuarios.findUnique({
      where: { correo_contacto: email },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Generar token de recuperación (expira en 15 minutos)
    const token = jwt.sign({ id: user.id_usuario }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const link = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Configuración nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"FluxData" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperación de contraseña",
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
             <a href="${link}">${link}</a>`,
    });

    res.json({ msg: "Enlace enviado a tu correo" });
  } catch (err) {
    console.error("Error en forgot-password:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
