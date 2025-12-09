// backend/src/routes/empresas.js
import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import nodemailer from "nodemailer";

const router = express.Router();
// Obtener todas las empresas registradas
router.get("/", async (req, res) => {
  try {
    const empresas = await prisma.usuarios.findMany({
      where: { rol_usuario: "empresa" }, // solo empresas
      select: {
        id_usuario: true,
        nombre_usuario: true,
        nit_empresa: true,
        correo_contacto: true,
        estado: true,
        fecha_registro: true,
      },
      orderBy: { fecha_registro: "desc" }
    });

    res.json(empresas);
  } catch (err) {
    console.error("Error obteniendo empresas:", err);
    res.status(500).json({ error: "Error obteniendo empresas" });
  }
});
// Obtener detalle de empresa
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
        regimen_tributario: true
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
        regimen_tributario: empresa.regimen_tributario || "No asignado"
      }
    });
  } catch (err) {
    console.error("Error obteniendo empresa:", err);
    res.status(500).json({ error: "Error obteniendo empresa" });
  }
});

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
// Configuración del transporte de correos
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post("/pre-register", async (req, res) => {
  try {
    const { nombre_empresa, direccion_empresa, nit_empresa, regimen_tributario, correo_contacto, contrasena, confirmar_contrasena } = req.body;

    if (!nombre_empresa || !nit_empresa || !correo_contacto || !contrasena || !confirmar_contrasena || !direccion_empresa || !regimen_tributario) {
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
          { direccion_empresa }
        ]
      }
    });

    // Preparar objeto de errores
    const errors = {};
    duplicados.forEach((e) => {
      if (e.nombre_usuario === nombre_empresa) errors.nombre_empresa = "Ya existe una empresa con ese nombre";
      if (e.nit_empresa === nit_empresa) errors.nit_empresa = "Ya existe una empresa con este NIT";
      if (e.direccion_empresa === direccion_empresa) errors.direccion_empresa = "Ya existe una empresa con esta dirección";
    });

    if (Object.keys(errors).length > 0) {
      return res.status(409).json({ errors });
    }
    // Hashear la contraseña
    const hashedPass = await bcrypt.hash(contrasena, 10);

    // Generar código de verificación
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar en DB
    await prisma.codigos_verificacion.create({
      data: {
        correo: correo_contacto,
        codigo,
        contrasena_temp: hashedPass,
        nombre_empresa,
        nit_empresa,
        direccion_empresa,
        regimen_tributario,
        expiracion: new Date(Date.now() + 10 * 60 * 1000)
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
    const { correo_contacto, codigo } = req.body;

    if (!correo_contacto || !codigo) {
      return res.status(400).json({ error: "Correo y código son obligatorios" });
    }
    // Buscar el registro temporal en la tabla de códigos
    const registro = await prisma.codigos_verificacion.findFirst({
      where: { correo: correo_contacto, codigo },
      orderBy: { id: "desc" } // tomar el más reciente
    });

    if (!registro) {
      return res.status(400).json({ error: "Código inválido o expirado" });
    }
    if (registro.expiracion < new Date()) {
      return res.status(400).json({ error: "Código expirado" });
    }

    // Crear usuario definitivo en la tabla de usuarios
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
        fecha_registro: new Date()
      }
    });

    // Eliminar el código temporal
    await prisma.codigos_verificacion.delete({ where: { id: registro.id } });

    res.json({ msg: "Código verificado y empresa registrada correctamente" });
  } catch (error) {
    console.error("Error en /verify-code:", error);
    res.status(500).json({ error: "Error verificando código" });
  }
});


// Reenviar código

router.post("/resend-code", async (req, res) => {
  try {
    const { correo_contacto } = req.body;

    if (!correo_contacto) {
      return res.status(400).json({ error: "El correo es obligatorio" });
    }
    // Buscar registro temporal
    const registro = await prisma.codigos_verificacion.findFirst({
      where: { correo: correo_contacto },
      orderBy: { id: "desc" } // tomar el más reciente
    });

    if (!registro) {
      return res.status(404).json({ error: "No se encontró un registro previo para este correo" });
    }

    // Generar un nuevo código
    const nuevoCodigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Actualizar el registro con nuevo código y nueva expiración
    await prisma.codigos_verificacion.update({
      where: { id: registro.id },
      data: {
        codigo: nuevoCodigo,
        expiracion: new Date(Date.now() + 10 * 60 * 1000) // 10 min más
      }
    });

    // Enviar correo con el nuevo código
    await transporter.sendMail({
      from: `"FluxData" <${process.env.EMAIL_USER}>`,
      to: correo_contacto,
      subject: "Código de verificación - Reenvío",
      text: `Tu nuevo código de verificación es: ${nuevoCodigo}`
    });

    res.json({ msg: "Se ha enviado un nuevo código a tu correo" });
  } catch (error) {
    console.error("Error en /resend-code:", error);
    res.status(500).json({ error: "Error reenviando código" });
  }
});


export default router;

