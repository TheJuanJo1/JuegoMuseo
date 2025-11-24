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

<<<<<<< HEAD
const app = express()

// ----------------------------------------------------
// ✅ CORRECCIÓN CORS para permitir Vercel y Localhost
// ----------------------------------------------------

const allowedOrigins = [
    "http://localhost:5173",           // Desarrollo local (Vite/React)
    "https://fluxdata-phi.vercel.app", // Producción en Vercel
];

const corsOptions = {
    origin: (origin, callback) => {
        // Permitir si el origen está en la lista blanca (o si es undefined para requests sin origen)
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            // Rechazar si no está en la lista
            callback(new Error(`Not allowed by CORS for origin: ${origin}`));
        }
    },
    credentials: true, // Importante para que las cookies/sesiones funcionen
};

app.use(cors(corsOptions));

// ----------------------------------------------------
// Middleware y Rutas
// ----------------------------------------------------
=======
import dashboardAdmin from "./routes/dashboardAdmin.js";


const app = express()
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));
>>>>>>> upstream/main

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

app.use("/api/admin/dashboard", dashboardAdmin);


app.get('/api/auth/me', authRequired, (req, res) => {
    res.json({ user: req.user })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`))