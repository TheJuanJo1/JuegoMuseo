// backend/src/routes/empresas.js
import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import Mailjet from "node-mailjet";

const router = express.Router();

// ===================================================
// CONFIGURACIÓN DE MAILJET
// ===================================================
const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

// Función para enviar correos
async function enviarCorreo(destinatario, asunto, mensaje) {
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
            To: [{ Email: destinatario }],
            Subject: asunto,
            HTMLPart: `<p>${mensaje}</p>`,
          },
        ],
      });

    console.log("Correo enviado a:", destinatario);
  } catch (err) {
    console.error("Error enviando correo Mailjet:", err);
    throw err;
  }
}

// ===================================================
// OBTENER TODAS LAS EMPRESAS
// ===================================================
router.get("/", async (req, res) => {
  try {
    const empresas = await prisma.usuarios.findMany({
      where: { rol_usuario: "empresa" },
      select: {
        id_usuario: true,
        nombre_usuario: true,
        nit_empresa: true,
        correo_contacto: true,
        estado: true,
        fecha_registro: true,
      },
      orderBy: { fecha_registro: "desc" },
    });

    res.json(empresas);
  } catch (err) {
    console.error("Error obteniendo empresas:", err);
    res.status(500).json({ error: "Error obteniendo empresas" });
  }
});

// ===================================================
// OBTENER UNA EMPRESA POR ID
// ===================================================
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const empresa = await prisma.usuarios.findUnique({
      where: { id_usuario: parseInt(id) },
      select: {
        id_usuario: true,
        nombre_usuario: true,
        nit_empresa: true,
        correo_contacto: true,
        estado: true,
        fecha_registro: true,
        direccion_empresa: true,
        regimen_tributario: true,
      },
    });

    if (!empresa) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    res.json({
      usuario: {
        id_usuario: empresa.id_usuario,
        nombre_usuario: empresa.nombre_usuario,
        nit_empresa: empresa.nit_empresa,
        correo_contacto: empresa.correo_contacto,
        estado: empresa.estado,
        fecha_registro: empresa.fecha_registro,
        direccion: empresa.direccion_empresa || "No asignada",
        regimen_tributario: empresa.regimen_tributario || "No asignado",
      },
    });
  } catch (err) {
    console.error("Error obteniendo empresa:", err);
    res.status(500).json({ error: "Error obteniendo empresa" });
  }
});

// ===================================================
// CAMBIAR ESTADO
// ===================================================
router.put("/:id/estado", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const empresa = await prisma.usuarios.update({
      where: { id_usuario: parseInt(id) },
      data: { estado },
    });

    res.json({ message: "Estado actualizado", empresa });
  } catch (err) {
    console.error("Error cambiando estado:", err);
    res.status(500).json({ error: "Error cambiando estado de la empresa" });
  }
});

// ===================================================
// PRE-REGISTER (envío de código con MAILJET)
// ===================================================
router.post("/pre-register", async (req, res) => {
  try {
    const {
      nombre_empresa,
      direccion_empresa,
      nit_empresa,
      regimen_tributario,
      correo_contacto,
      contrasena,
      confirmar_contrasena,
    } = req.body;

    if (
      !nombre_empresa ||
      !nit_empresa ||
      !correo_contacto ||
      !contrasena ||
      !confirmar_contrasena ||
      !direccion_empresa ||
      !regimen_tributario
    ) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    if (contrasena !== confirmar_contrasena) {
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    // Buscar duplicados
    const duplicados = await prisma.usuarios.findMany({
      where: {
        OR: [
          { nombre_usuario: nombre_empresa },
          { nit_empresa },
          { direccion_empresa },
        ],
      },
    });

    const errors = {};
    duplicados.forEach((e) => {
      if (e.nombre_usuario === nombre_empresa)
        errors.nombre_empresa = "Ya existe una empresa con ese nombre";
      if (e.nit_empresa === nit_empresa)
        errors.nit_empresa = "Ya existe una empresa con este NIT";
      if (e.direccion_empresa === direccion_empresa)
        errors.direccion_empresa = "Ya existe una empresa con esta dirección";
    });

    if (Object.keys(errors).length > 0) {
      return res.status(409).json({ errors });
    }

    const hashedPass = await bcrypt.hash(contrasena, 10);

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.codigos_verificacion.create({
      data: {
        correo: correo_contacto,
        codigo,
        contrasena_temp: hashedPass,
        nombre_empresa,
        nit_empresa,
        direccion_empresa,
        regimen_tributario,
        expiracion: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // ✉️ ENVIAR CÓDIGO CON MAILJET
    await enviarCorreo(
      correo_contacto,
      "Código de verificación",
      `Tu código de verificación es: <b>${codigo}</b>`
    );

    res.json({ msg: "Se envió un código de verificación al correo." });
  } catch (err) {
    console.error("Error en /pre-register:", err);
    res.status(500).json({ error: "Error en pre-registro" });
  }
});

// ===================================================
// VERIFY CODE
// ===================================================
router.post("/verify-code", async (req, res) => {
  try {
    const { correo_contacto, codigo } = req.body;

    if (!correo_contacto || !codigo) {
      return res.status(400).json({ error: "Correo y código son obligatorios" });
    }

    const registro = await prisma.codigos_verificacion.findFirst({
      where: { correo: correo_contacto, codigo },
      orderBy: { id: "desc" },
    });

    if (!registro) {
      return res.status(400).json({ error: "Código inválido o expirado" });
    }

    if (registro.expiracion < new Date()) {
      return res.status(400).json({ error: "Código expirado" });
    }

    await prisma.usuarios.create({
      data: {
        nombre_usuario: registro.nombre_empresa,
        nit_empresa: registro.nit_empresa,
        direccion_empresa: registro.direccion_empresa,
        regimen_tributario: registro.regimen_tributario,
        correo_contacto: registro.correo,
        contrasena_usuario: registro.contrasena_temp,
        rol_usuario: "empresa",
        estado: "activo",
        fecha_registro: new Date(),
      },
    });

    await prisma.codigos_verificacion.delete({ where: { id: registro.id } });

    res.json({ msg: "Código verificado y empresa registrada correctamente" });
  } catch (error) {
    console.error("Error en /verify-code:", error);
    res.status(500).json({ error: "Error verificando código" });
  }
});

// ===================================================
// RESEND CODE (MAILJET)
// ===================================================
router.post("/resend-code", async (req, res) => {
  try {
    const { correo_contacto } = req.body;

    if (!correo_contacto) {
      return res.status(400).json({ error: "El correo es obligatorio" });
    }

    const registro = await prisma.codigos_verificacion.findFirst({
      where: { correo: correo_contacto },
      orderBy: { id: "desc" },
    });

    if (!registro) {
      return res
        .status(404)
        .json({ error: "No se encontró un registro previo para este correo" });
    }

    const nuevoCodigo = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.codigos_verificacion.update({
      where: { id: registro.id },
      data: {
        codigo: nuevoCodigo,
        expiracion: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await enviarCorreo(
      correo_contacto,
      "Código de verificación - Reenvío",
      `Tu nuevo código es: <b>${nuevoCodigo}</b>`
    );

    res.json({ msg: "Se ha enviado un nuevo código a tu correo" });
  } catch (error) {
    console.error("Error en /resend-code:", error);
    res.status(500).json({ error: "Error reenviando código" });
  }
});

export default router;