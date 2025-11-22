// backend/src/routes/empresas.js
import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { Resend } from "resend";

const router = express.Router();

// --------------------------------------------------------
// RESEND CONFIG
// --------------------------------------------------------
const resend = new Resend(process.env.RESEND_API_KEY);

// --------------------------------------------------------
// FUNCIÓN PARA ENVIAR CÓDIGO
// --------------------------------------------------------
async function enviarCodigoCorreo(destino, codigo) {
  try {
    await resend.emails.send({
      from: "FluxData <onboarding@resend.dev>",  // NO REQUIERE DOMINIO
      to: destino,
      subject: "Código de verificación",
      html: `
        <h2>Tu código de verificación</h2>
        <p><b style="font-size:22px">${codigo}</b></p>
        <p>Este código expirará en 10 minutos.</p>
      `
    });

    return true;
  } catch (err) {
    console.error("ERROR enviando correo con Resend:", err);
    return false;
  }
}

// --------------------------------------------------------
// PRE-REGISTER (Paso 1)
// --------------------------------------------------------
router.post("/pre-register", async (req, res) => {
  try {
    const {
      nombre_empresa,
      nit_empresa,
      correo_contacto,
      contrasena,
      confirmar_contrasena
    } = req.body;

    // Validación
    if (!nombre_empresa || !nit_empresa || !correo_contacto || !contrasena || !confirmar_contrasena) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    if (contrasena !== confirmar_contrasena) {
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    // Verificar empresa existente
    const empresaExistente = await prisma.usuarios.findFirst({
      where: {
        OR: [
          { nit_empresa },
          { nombre_usuario: nombre_empresa },
          { correo_contacto }
        ]
      }
    });

    if (empresaExistente) {
      return res.status(409).json({
        error: "Ya existe una empresa registrada con ese nombre, NIT o correo."
      });
    }

    // Hash de contraseña
    const hashedPass = await bcrypt.hash(contrasena, 10);

    // Código de verificación
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Borrar códigos anteriores
    await prisma.codigos_verificacion.deleteMany({
      where: { correo: correo_contacto }
    });

    // Guardar datos y código
    await prisma.codigos_verificacion.create({
      data: {
        correo: correo_contacto,
        codigo,
        contrasena_temp: hashedPass,
        nombre_empresa,
        nit_empresa,
        expiracion: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    // Enviar correo
    const enviado = await enviarCodigoCorreo(correo_contacto, codigo);

    if (!enviado) {
      return res.status(500).json({ error: "No se pudo enviar el correo de verificación" });
    }

    res.json({ msg: "Se envió un código de verificación a tu correo." });

  } catch (err) {
    console.error("Error en /pre-register:", err);
    res.status(500).json({ error: "Error en pre-registro" });
  }
});

// --------------------------------------------------------
// VERIFY CODE (Paso 2)
// --------------------------------------------------------
router.post("/verify-code", async (req, res) => {
  try {
    const { correo_contacto: correo, codigo } = req.body;

    const registro = await prisma.codigos_verificacion.findFirst({
      where: { correo, codigo }
    });

    if (!registro) {
      return res.status(400).json({ error: "Código inválido" });
    }

    if (new Date() > registro.expiracion) {
      return res.status(400).json({ error: "El código ha expirado" });
    }

    // Registrar empresa real
    const empresa = await prisma.usuarios.create({
      data: {
        nombre_usuario: registro.nombre_empresa,
        nit_empresa: registro.nit_empresa,
        correo_contacto: registro.correo,
        contrasena_usuario: registro.contrasena_temp,
        rol_usuario: "empresa"
      }
    });

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
        error: "Ya existe una cuenta registrada con este correo."
      });
    }

    console.error("Error en /verify-code:", err);
    res.status(500).json({ error: "Error en verificación" });
  }
});

// --------------------------------------------------------
// RESEND CODE (Paso 3)
// --------------------------------------------------------
router.post("/resend-code", async (req, res) => {
  try {
    const { correo_contacto } = req.body;

    if (!correo_contacto) {
      return res.status(400).json({ error: "El correo es obligatorio" });
    }

    const registro = await prisma.codigos_verificacion.findFirst({
      where: { correo: correo_contacto },
      orderBy: { id: "desc" }
    });

    if (!registro) {
      return res.status(404).json({ error: "No se encontró un registro previo para este correo" });
    }

    const nuevoCodigo = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.codigos_verificacion.update({
      where: { id: registro.id },
      data: {
        codigo: nuevoCodigo,
        expiracion: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    await enviarCodigoCorreo(correo_contacto, nuevoCodigo);

    res.json({ msg: "Se ha enviado un nuevo código a tu correo" });

  } catch (err) {
    console.error("Error en /resend-code:", err);
    res.status(500).json({ error: "Error reenviando código" });
  }
});

export default router;