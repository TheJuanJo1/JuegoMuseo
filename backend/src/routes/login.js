// backend/src/routes/login.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = Router();

// -------------------------------------------------------------
// LOGIN GENERAL (Admin o Empresa)
// -------------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { emailOrName, password } = req.body;

    if (!emailOrName || !password) {
      return res.status(400).json({
        error: "Usuario/Email y contraseña son requeridos",
      });
    }

    // ---------------------------------------------------------
    // LOGIN ADMIN (variables del .env)
    // ---------------------------------------------------------
    if (
      emailOrName === process.env.ADMIN_USER &&
      password === process.env.ADMIN_PASS
    ) {
      const token = jwt.sign(
        {
          sub: "admin",
          role: "admin",
          name: process.env.ADMIN_NAME,
          email: process.env.ADMIN_USER,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 día
      });

      return res.json({
        message: "Login exitoso (admin)",
        user: {
          id: "admin",
          name: process.env.ADMIN_NAME,
          email: process.env.ADMIN_USER,
          role: "admin",
        },
      });
    }

    // ---------------------------------------------------------
    // LOGIN EMPRESA (base de datos)
    // ---------------------------------------------------------
    const user = await prisma.usuarios.findFirst({
      where: {
        OR: [
          { correo_contacto: emailOrName },
          { nombre_usuario: emailOrName },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    if (user.estado === "inactivo") {
      return res.status(403).json({
        error: "Tu cuenta está inactiva. Contacta al administrador.",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.contrasena_usuario
    );

    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        sub: user.id_usuario,
        email: user.correo_contacto,
        name: user.nombre_usuario,
        role: "empresa",
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login exitoso",
      user: {
        id: user.id_usuario,
        name: user.nombre_usuario,
        email: user.correo_contacto,
        role: "empresa",
      },
    });

  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ error: "Error interno en login" });
  }
});

export default router;