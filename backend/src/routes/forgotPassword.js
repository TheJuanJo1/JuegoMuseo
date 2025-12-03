// backend/src/routes/forgotPassword.js
import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { sendEmail } from "../mailjet.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "El email es obligatorio" });
    }

    // Buscar usuario por correo
    const user = await prisma.usuarios.findUnique({
      where: { correo_contacto: email },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Crear token con expiración de 15 minutos
    const token = jwt.sign(
      { id: user.id_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const link = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Contenido del correo
    const html = `
      <p>Hola <strong>${user.nombre_usuario}</strong>,</p>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>
        Haz clic en el siguiente enlace para crear una nueva contraseña:
      </p>
      <p>
        <a href="${link}" style="color:#4F46E5; font-size:16px; font-weight:bold;">
          Restablecer contraseña
        </a>
      </p>
      <p>Este enlace expirará en 15 minutos.</p>
      <br>
      <p>Si no solicitaste esto, puedes ignorar este correo.</p>
    `;

    // Enviar email con Mailjet
    const enviado = await sendEmail(
      email,
      "Recuperación de contraseña - FluxData",
      html
    );

    if (!enviado) {
      return res.status(500).json({ error: "No se pudo enviar el correo" });
    }

    return res.json({ msg: "Enlace de recuperación enviado a tu correo" });

  } catch (error) {
    console.error("Error en forgotPassword:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
