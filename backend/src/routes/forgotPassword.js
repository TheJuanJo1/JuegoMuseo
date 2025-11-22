import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Resend } from "resend";

const router = express.Router();
const prisma = new PrismaClient();

// ✅ Asegurarse de cargar la API Key CORRECTA
const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.usuarios.findUnique({
      where: { correo_contacto: email },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // 🔐 Crear token JWT válido por 15 min
    const token = jwt.sign({ id: user.id_usuario }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // URL del frontend
    const link = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // 🟢 Validar que EMAIL_FROM exista
    if (!process.env.EMAIL_FROM) {
      console.error("❌ ERROR: Falta EMAIL_FROM en .env");
      return res.status(500).json({ error: "Configuración faltante del servidor" });
    }

    // ✉️ Enviar correo con Resend
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM, // ejemplo: "FluxData <soporte@tudominio.com>"
      to: email,
      subject: "Recuperación de contraseña",
      html: `
        <p>Hola ${user.nombre || ""},</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${link}" style="color: #4F46E5; font-weight: bold;">
          Restablecer contraseña
        </a>
        <p>Este enlace expirará en 15 minutos.</p>
      `,
    });

    if (response.error) {
      console.error("❌ Error enviando correo:", response.error);
      return res.status(500).json({ error: "No se pudo enviar el correo" });
    }

    res.json({ msg: "Enlace enviado a tu correo" });

  } catch (err) {
    console.error("❌ Error en forgot-password:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
