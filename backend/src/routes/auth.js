// backend/src/routes/auth.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

const router = Router();

// -------------------------------------------------------------
// REGISTRO DE EMPRESAS / INTERMEDIARIOS
// -------------------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, nit } = req.body;

    // Validación básica
    if (!name || !email || !password || !nit) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    if (!/^\d{10}$/.test(nit)) {
      return res.status(400).json({
        error:
          "El NIT debe tener exactamente 10 dígitos numéricos (incluyendo dígito de verificación)",
      });
    }

    if (!email.includes("@")) {
      return res
        .status(400)
        .json({ error: "El correo electrónico debe contener '@'" });
    }

    // Revisar si ya existe empresa por NIT o nombre
    const empresaExistente = await prisma.usuarios.findFirst({
      where: {
        OR: [{ nit_empresa: nit }, { nombre_usuario: name }],
      },
    });

    if (empresaExistente) {
      return res.status(409).json({
        error: "Ya existe una empresa con ese NIT o nombre registrado.",
      });
    }

    // Revisar email único
    const correoExiste = await prisma.usuarios.findUnique({
      where: { correo_contacto: email },
    });

    if (correoExiste) {
      return res
        .status(409)
        .json({ error: "El correo electrónico ya está registrado." });
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    // Guardar usuario en la base de datos
    const user = await prisma.usuarios.create({
      data: {
        nombre_usuario: name,
        correo_contacto: email,
        contrasena_usuario: hash,
        nit_empresa: nit,
        rol_usuario: "Intermediario",
        estado: "activo",
      },
      select: {
        id_usuario: true,
        nombre_usuario: true,
        correo_contacto: true,
      },
    });

    return res.status(201).json({
      message: "Registro exitoso",
      user,
    });
  } catch (err) {
    console.error("Error en registro:", err);

    // Manejo de errores Prisma
    if (err.code === "P2002") {
      const campo = err.meta.target[0];

      const mensajes = {
        nit_empresa: "El NIT ya está registrado.",
        nombre_usuario: "El nombre de usuario ya está registrado.",
        correo_contacto: "El correo electrónico ya está registrado.",
      };

      return res.status(409).json({ error: mensajes[campo] || "Dato duplicado" });
    }

    return res.status(500).json({ error: "Error en registro" });
  }
});

export default router;
