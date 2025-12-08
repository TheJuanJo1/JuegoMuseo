import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Middlewares
import { authRequired } from "./middleware/auth.js";

// Rutas
import authRoutes from "./routes/auth.js";
import empresasRoutes from "./routes/empresas.js";
import loginRoutes from "./routes/login.js";
import forgotPasswordRoutes from "./routes/forgotPassword.js";
import resetPasswordRoutes from "./routes/resetPassword.js";
import ultimosRoutes from "./routes/ultimos.js";
import estadisticasRoutes from "./routes/estadisticas.js";
import filtrarRoutes from "./routes/filtrar.js";
import configurarRoutes from "./routes/configuracion.js";
import tokenRoutes from "./routes/token.js";
import registrosRouter from "./routes/registros.js";
import dashboardAdmin from "./routes/dashboardAdmin.js";
import xmlDashboardRouter from "./routes/xmldashboard.js";

dotenv.config();

const app = express();

// ===============
// 🔥 CORS FIX
// ===============
app.use(
  cors({
    origin: [
      "https://fluxdata-phi.vercel.app",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// Necesario para JSON
app.use(express.json());

// Ruta base
app.get("/", (req, res) => {
  res.json({ ok: true, msg: "API FluxData funcionando correctamente" });
});

// Ruta protegida de prueba
app.get("/api/auth/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/empresas", authRequired, empresasRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/reset-password", resetPasswordRoutes);
app.use("/api/ultimos", authRequired, ultimosRoutes);
app.use("/api/estadisticas", authRequired, estadisticasRoutes);
app.use("/api/filtrar", authRequired, filtrarRoutes);
app.use("/api/configuracion", authRequired, configurarRoutes);
app.use("/api/token", authRequired, tokenRoutes);
app.use("/api/registros", authRequired, registrosRouter);
app.use("/api/admin/dashboard", authRequired, dashboardAdmin);
app.use("/api/dashboard-xml", authRequired, xmlDashboardRouter);

// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
