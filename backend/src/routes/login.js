// backend/src/routes/login.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { emailOrName, password } = req.body;

    if (!emailOrName || !password) {
      return res.status(400).json({ error: "usuario/email y password son requeridos" });
    }

    // Buscar por correo_contacto o nombre_usuario
    const user = await prisma.usuarios.findFirst({
      where: {
        OR: [
          { correo_contacto: emailOrName },
          { nombre_usuario: emailOrName },
        ],
      },
    });

    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    // Validar contraseña
    const ok = await bcrypt.compare(password, user.contrasena_usuario);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    // Crear token
    const token = jwt.sign(
      {
        sub: user.id_usuario,
        email: user.correo_contacto,
        name: user.nombre_usuario,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    //Guardamos el token en una cookie HTTPOnly
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, //cambiar a true si usas HTTPS
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    return res.json({
      message: "Login exitoso",
      user: {
        id: user.id_usuario,
        name: user.nombre_usuario,
        email: user.correo_contacto,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error en login" });
  }
});

export default router;
