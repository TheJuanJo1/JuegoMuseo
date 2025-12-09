import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

const router = Router()
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, nit} = req.body
    if (!name || !email || !password || !nit) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    }
    if (!/^\d{10}$/.test(nit)) {
      return res.status(400).json({ error: "El NIT debe tener 10 dígitos numéricos (incluyendo dígito de verificación)" });
    }
    if (!email.includes("@")) {
      return res.status(400).json({ error: "El correo electrónico debe contener '@'" });
    }
    const empresaExistente = await prisma.usuarios.findFirst({
      where: {
        OR: [
          { nit_empresa: nit },
          { nombre_usuario: name }
        ]
      }
    });

    if (empresaExistente) {
      return res.status(409).json({
        error: "Ya existe una empresa con ese NIT o nombre registrado."
      });
    }
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
        nit_empresa: nit,
        rol_usuario: "empresa", // opcional
        estado: "activo",
        fecha_registro: new Date()
      },
      select: {
        id_usuario: true,
        nombre_usuario: true,
        correo_contacto: true
      }
    })

    return res.status(201).json({ user })
  } catch (err) {
     if (err.code === "P2002") {
      const campo = err.meta.target[0]

      if (campo === "nit_empresa") {
        return res.status(409).json({
          error: "El NIT ya está registrado por otra empresa."
        })
      }

      if (campo === "nombre_usuario") {
        return res.status(409).json({
          error: "El nombre de usuario ya está en uso."
        })
      }

      if (campo === "correo_contacto") {
        return res.status(409).json({
          error: "El correo electrónico ya está registrado."
        })
      }
    }
    console.error(err)
    return res.status(500).json({ error: 'Error en registro' })
  }
})

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
