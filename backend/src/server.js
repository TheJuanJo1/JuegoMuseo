import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import clientesRoutes from "./routes/clientes.js"
import empresasRoutes from "./routes/empresas.js"
import loginRoutes from "./routes/login.js"
import forgotPasswordRoutes from "./routes/forgotPassword.js";
import resetPasswordRoutes from "./routes/resetPassword.js";
import facturasNotasRoutes from "./routes/facturasnotas.js";
import cookieParser from "cookie-parser";
import { authRequired } from './middleware/auth.js'
import ultimosRoutes from "./routes/ultimos.js";
import estadisticasRoutes from "./routes/estadisticas.js";
import filtrarRoutes from "./routes/filtrar.js";
import configurarRoutes from "./routes/configuracion.js";
import tokenRoutes from "./routes/token.js";
import pdfRoutes from "./routes/pdf.js";
import xmlRoutes from "./routes/xml.js";
import registrosRouter from "./routes/registros.js";

const app = express()
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

app.use(express.json())
app.use(cookieParser());
app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'API FluxData funcionando' })
})


// Ejemplo de ruta protegida
app.get("/api/auth/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

// Rutas de empresas
app.use('/api/empresas', empresasRoutes)//Habilitar empresas

app.use("/api/login", loginRoutes)

// Proteger /api/auth/me con middleware
app.use('/api/auth/me', authRequired)

app.use("/api/forgot-password", forgotPasswordRoutes);

app.use("/api/reset-password", resetPasswordRoutes);

app.use("/api/facturas-notas", facturasNotasRoutes);

app.use("/api/ultimos", ultimosRoutes);

app.use("/api/estadisticas", estadisticasRoutes);

app.use("/api/filtrar", filtrarRoutes);

app.use("/api/configuracion", configurarRoutes)

app.use("/api/token", tokenRoutes);

app.use("/api/pdf", pdfRoutes);

app.use("/api/xml", xmlRoutes);

app.use("/api/clientes", clientesRoutes)

app.use("/api/registros", registrosRouter);


app.get('/api/auth/me', authRequired, (req, res) => {
  res.json({ user: req.user })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`))

