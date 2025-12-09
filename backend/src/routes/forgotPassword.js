// backend/src/routes/forgotPassword.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import Mailjet from "node-mailjet";

const router = express.Router();
const prisma = new PrismaClient();

// ===============================
// CONFIGURACIÓN MAILJET
// ===============================
const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

// Función para enviar correo
async function enviarCorreo(destinatario, asunto, mensajeHTML) {
  try {
    await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MJ_SENDER,
              Name: "FluxData",
            },
            To: [
              {
                Email: destinatario,
              },
            ],
            Subject: asunto,
            HTMLPart: mensajeHTML,
          },
        ],
      });

    console.log("Correo enviado a:", destinatario);
  } catch (err) {
    console.error("Error enviando correo Mailjet:", err);
    throw err;
  }
}

// ===============================
// FORGOT PASSWORD
// ===============================
router.post("/", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.usuarios.findUnique({
      where: { correo_contacto: email },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Generar token válido 15 minutos
    const token = jwt.sign(
      { id: user.id_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const link = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Enviar correo con Mailjet
    await enviarCorreo(
      email,
      "Recuperación de contraseña",
      `
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <p><a href="${link}" style="color:#005eff; font-weight:bold;">${link}</a></p>
        <p>Este enlace expirará en 15 minutos.</p>
      `
    );

    res.json({ msg: "Enlace enviado a tu correo" });

  } catch (err) {
    console.error("Error en forgot-password:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
