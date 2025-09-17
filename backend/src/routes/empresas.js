// backend/src/routes/empresas.js
import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const router = express.Router();

// Configuración del transporte de correos
const transporter = nodemailer.createTransport({
  service: "gmail", // o tu servicio SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ================================
   Paso 1: Pre-registro con envío de código
================================== */
// Paso 1: Pre-registro con envío de código
router.post("/pre-register", async (req, res) => {
  try {
    console.log("📩 Body recibido:", req.body);

    const { nombre_empresa, nit_empresa, correo_contacto, contrasena, confirmar_contrasena } = req.body;

    if (!nombre_empresa || !nit_empresa || !correo_contacto || !contrasena || !confirmar_contrasena) {
      console.log("❌ Faltan campos");
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    if (contrasena !== confirmar_contrasena) {
      console.log("❌ Contraseñas no coinciden");
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    console.log("✅ Validación OK, generando código...");

    // Generar código
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar en DB
    const saveCode = await prisma.codigos_verificacion.create({
      data: {
        correo: correo_contacto,
        codigo,
        contrasena_temp: contrasena,
        nombre_empresa,
        nit_empresa,
        expiracion: new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
      }
    });

    console.log("💾 Código guardado en DB:", saveCode);

    // Enviar email
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"FluxData" <${process.env.EMAIL_USER}>`,
      to: correo_contacto,
      subject: "Código de verificación",
      text: `Tu código de verificación es: ${codigo}`
    });

    console.log("📨 Correo enviado a:", correo_contacto);

    res.json({ msg: "Se envió un código de verificación al correo." });

  } catch (err) {
    console.error("💥 Error en /pre-register:", err);
    res.status(500).json({ error: "Error en pre-registro" });
  }
});


/* ================================
   Paso 2: Verificar código y crear usuario
================================== */
router.post("/verify-code", async (req, res) => {
  try {
    const { correo, codigo } = req.body;

    const registro = await prisma.codigos_verificacion.findFirst({
      where: { correo, codigo }
    });

    if (!registro) {
      return res.status(400).json({ error: "Código inválido" });
    }

    if (new Date() > registro.expiracion) {
      return res.status(400).json({ error: "El código ha expirado" });
    }

    // Crear empresa en Usuarios
    const empresa = await prisma.usuarios.create({
      data: {
        nombre_usuario: registro.nombre_empresa,
        nit_empresa: registro.nit_empresa,
        correo_contacto: registro.correo,
        contrasena_usuario: registro.contrasena_temp,
        rol_usuario: "empresa"
      }
    });

    // Eliminar el registro temporal
    await prisma.codigos_verificacion.delete({
      where: { id: registro.id }
    });

    res.json({
      message: "Empresa verificada y registrada",
      empresa: {
        id: empresa.id_usuario,
        nombre: empresa.nombre_usuario,
        correo: empresa.correo_contacto
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en verificación" });
  }
});

export default router;
