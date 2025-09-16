// backend/src/routes/auth.js
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { prisma } from '../lib/prisma.js'

const router = Router()

// Registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email y password son requeridos' })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ error: 'Email ya registrado' })

    const hash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hash },
      select: { id: true, name: true, email: true, createdAt: true }
    })

    return res.status(201).json({ user })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error en registro' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'email y password son requeridos' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' })

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return res.status(401).json({ error: 'Credenciales inválidas' })

    const payload = { sub: user.id, email: user.email, name: user.name }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error en login' })
  }
})

export default router;
