// backend/src/routes/empresas.js
import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
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
router.post("/pre-register", async (req, res) => {
  try {
    const { nombre_empresa, nit_empresa, correo_contacto, contrasena, confirmar_contrasena } = req.body;

    if (!nombre_empresa || !nit_empresa || !correo_contacto || !contrasena || !confirmar_contrasena) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    if (contrasena !== confirmar_contrasena) {
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    //Hashear la contraseña ANTES de guardarla
    const hashedPass = await bcrypt.hash(contrasena, 10);

    // Generar código
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar en DB (con la contraseña ya encriptada)
    await prisma.codigos_verificacion.create({
      data: {
        correo: correo_contacto,
        codigo,
        contrasena_temp: hashedPass, // guardamos el hash, no el texto plano
        nombre_empresa,
        nit_empresa,
        expiracion: new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
      }
    });

    // Enviar email
    await transporter.sendMail({
      from: `"FluxData" <${process.env.EMAIL_USER}>`,
      to: correo_contacto,
      subject: "Código de verificación",
      text: `Tu código de verificación es: ${codigo}`
    });

    res.json({ msg: "Se envió un código de verificación al correo." });

  } catch (err) {
    console.error("Error en /pre-register:", err);
    res.status(500).json({ error: "Error en pre-registro" });
  }
});
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
    if (err.code === "P2002" && err.meta?.target?.includes("correo_contacto")) {
      return res.status(400).json({
        error: "Ya existe una cuenta registrada con este correo. Intenta iniciar sesión."
      });
    }

    console.error("Error en /verify-code:", err);
    res.status(500).json({ error: "Error en verificación" });
  }
});

export default router;

