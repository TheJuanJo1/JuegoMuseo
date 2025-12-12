import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

// Middlewares
import { authRequired } from "./middleware/auth.js"

// Rutas
import authRoutes from "./routes/auth.js"
import empresasRoutes from "./routes/empresas.js"
import loginRoutes from "./routes/login.js"
import forgotPasswordRoutes from "./routes/forgotPassword.js"
import resetPasswordRoutes from "./routes/resetPassword.js"
import ultimosRoutes from "./routes/ultimos.js"
import estadisticasRoutes from "./routes/estadisticas.js"
import filtrarRoutes from "./routes/filtrar.js"
import tokenRoutes from "./routes/token.js"
import registrosRouter from "./routes/registros.js"
import dashboardAdmin from "./routes/dashboardAdmin.js"
import xmlDashboardRouter from "./routes/xmldashboard.js"


dotenv.config()

const app = express()

// CORS SOLO PARA DESARROLLO LOCAL
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://fluxdata-ten.vercel.app",
      "http://localhost:5173"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
)

app.use(express.json())
app.use(cookieParser())

// Ruta base
app.get("/", (req, res) => {
  res.json({ ok: true, msg: "API FluxData funcionando en LOCALHOST" })
})

// Ruta protegida de prueba
app.get("/api/auth/me", authRequired, (req, res) => {
  res.json({ user: req.user })
})

// Rutas API
app.use("/api/auth", authRoutes)
app.use("/api/empresas", empresasRoutes)
app.use("/api/login", loginRoutes)
app.use("/api/forgot-password", forgotPasswordRoutes)
app.use("/api/reset-password", resetPasswordRoutes)
app.use("/api/ultimos", ultimosRoutes)
app.use("/api/estadisticas", estadisticasRoutes)
app.use("/api/filtrar", filtrarRoutes)
app.use("/api/token", tokenRoutes)
app.use("/api/registros", registrosRouter)
app.use("/api/admin/dashboard", dashboardAdmin)
app.use("/api/dashboard-xml", xmlDashboardRouter);



// Puerto
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
