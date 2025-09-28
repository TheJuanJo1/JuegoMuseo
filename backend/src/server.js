import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js"; 
import { authRequired } from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ruta base de prueba
app.get("/", (req, res) => {
  res.json({ ok: true, msg: "API funcionando" });
});

// Todas las rutas (sin versionado)
app.use("/api", routes);

// Ejemplo de ruta protegida
app.get("/api/auth/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
