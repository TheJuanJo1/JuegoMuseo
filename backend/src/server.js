import express from "express"
import cors from "cors"
import dotenv from "dotenv";
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
import dashboardAdmin from "./routes/dashboardAdmin.js";

dotenv.config();
const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://fluxdata3.onrender.com" 
  ],
  credentials: true,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json());
app.use(cookieParser());

// Ruta base
app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'API FluxData funcionando' })
});

// Ruta protegida de prueba
app.get("/api/auth/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

// Rutas
app.use('/api/empresas', empresasRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/reset-password", resetPasswordRoutes);
app.use("/api/facturas-notas", facturasNotasRoutes);
app.use("/api/ultimos", ultimosRoutes);
app.use("/api/estadisticas", estadisticasRoutes);
app.use("/api/filtrar", filtrarRoutes);
app.use("/api/configuracion", configurarRoutes);
app.use("/api/token", tokenRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/xml", xmlRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/registros", registrosRouter);
app.use("/api/admin/dashboard", dashboardAdmin);

// Doble ruta protegida (si quieres eliminar una me dices)
app.get('/api/auth/me', authRequired, (req, res) => {
  res.json({ user: req.user });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
