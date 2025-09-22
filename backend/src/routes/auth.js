// backend/src/routes/auth.js
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

const router = Router()

// 📌 Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' })
    }

    // Validar si ya existe el usuario
    const exists = await prisma.usuarios.findUnique({
      where: { correo_contacto: email }
    })
    if (exists) return res.status(409).json({ error: 'Email ya registrado' })

    // Encriptar contraseña
    const hash = await bcrypt.hash(password, 10)

    // Guardar usuario en la BD
    const user = await prisma.usuarios.create({
      data: {
        nombre_usuario: name,
        correo_contacto: email,
        contrasena_usuario: hash,
        rol_usuario: "empresa" // opcional
      },
      select: {
        id_usuario: true,
        nombre_usuario: true,
        correo_contacto: true
      }
    })

    return res.status(201).json({ user })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error en registro' })
  }
})

// 📌 Login
router.post("/login", async (req, res) => {
  try {
    const { emailOrName, password } = req.body

    if (!emailOrName || !password) {
      return res.status(400).json({ error: "usuario/email y password son requeridos" })
    }

    // Buscar usuario por correo o nombre
    const user = await prisma.usuarios.findFirst({
      where: {
        OR: [
          { correo_contacto: emailOrName },
          { nombre_usuario: emailOrName }
        ]
      }
    })

    if (!user) return res.status(401).json({ error: "Usuario no encontrado" })

    const valid = await bcrypt.compare(password, user.contrasena_usuario)
    if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" })

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id_usuario, email: user.correo_contacto },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    )

    // Guardar token en cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // cambia a true en producción con HTTPS
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000 // 1 hora
    })

    res.json({ message: "Login exitoso" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error en el servidor" })
  }
})

export default router
