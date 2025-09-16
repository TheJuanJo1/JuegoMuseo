import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import clientesRoutes from './routes/clientes.js'
import empresasRoutes from './routes/empresas.js'   //Importar empresas
import loginRoutes from "./routes/login.js"
import forgotPasswordRoutes from "./routes/forgotPassword.js";
import resetPasswordRoutes from "./routes/resetPassword.js";
import { authRequired } from './middleware/auth.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'API FluxData Auth funcionando' })
})

// Rutas de autenticación
app.use('/api/auth', authRoutes)

// Rutas de clientes
app.use('/api/clientes', clientesRoutes)

// Rutas de empresas
app.use('/api/empresas', empresasRoutes)  //Habilitar empresas

app.use("/api/login", loginRoutes)

// Proteger /api/auth/me con middleware
app.use('/api/auth/me', authRequired)

app.use("/api/forgot-password", forgotPasswordRoutes);

app.use("/api/reset-password", resetPasswordRoutes);


// Versión protegida de /me
app.get('/api/auth/me', authRequired, (req, res) => {
  res.json({ user: req.user })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`))
