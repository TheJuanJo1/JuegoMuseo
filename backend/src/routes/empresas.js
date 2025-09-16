import express from "express"
import bcrypt from "bcryptjs"
import { prisma } from "../lib/prisma.js"

const router = express.Router()

// Registrar Empresa
router.post("/register", async (req, res) => {
  try {
    const { nombre_empresa, nit_empresa, correo_contacto, contrasena, confirmar_contrasena } = req.body

    // Validar campos
    if (!nombre_empresa || !nit_empresa || !correo_contacto || !contrasena || !confirmar_contrasena) {
      return res.status(400).json({ error: "Todos los campos son requeridos" })
    }

    if (contrasena !== confirmar_contrasena) {
      return res.status(400).json({ error: "Las contraseñas no coinciden" })
    }

    // Validar si ya existe empresa con ese NIT o correo
    const existe = await prisma.usuarios.findFirst({
      where: {
        OR: [
          { nit_empresa },
          { correo_contacto }
        ]
      }
    })

    if (existe) {
      return res.status(400).json({ error: "La empresa ya está registrada con ese NIT o correo" })
    }

    // Hashear contraseña
    const hashedPass = await bcrypt.hash(contrasena, 10)

    // Crear empresa en la BD
    const empresa = await prisma.usuarios.create({
      data: {
        nombre_usuario: nombre_empresa,   // 👈 en tu tabla Usuarios
        nit_empresa,
        correo_contacto,
        contrasena_usuario: hashedPass,
        rol_usuario: "empresa"           // 👈 rol opcional
      }
    })

    res.json({
      message: "Empresa registrada exitosamente",
      empresa: {
        id: empresa.id_usuario,
        nombre_empresa: empresa.nombre_usuario,
        nit_empresa: empresa.nit_empresa,
        correo_contacto: empresa.correo_contacto
      }
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error en el registro de empresa" })
  }
})

export default router
