// routes/token.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "CLAVE_SUPER_SECRETA";
const TOKEN_EXPIRES = "7d";

// ---------------------------------------------
// Generador global (opcional si quieres usarlo en otras rutas)
// ---------------------------------------------
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// ---------------------------------------------
// RUTAS TOKEN (como antes lo usabas)
// ---------------------------------------------

// GET: obtener token
router.get("/:usuarioId", (req, res) => {
  try {
    const { usuarioId } = req.params;

    const token = generateToken({ id: usuarioId });

    return res.json({ token });
  } catch (err) {
    console.error("Error al generar token:", err);
    res.status(500).json({ error: "Error al generar token" });
  }
});

// POST: regenerar token
router.post("/regenerar/:usuarioId", (req, res) => {
  try {
    const { usuarioId } = req.params;

    const token = generateToken({ id: usuarioId });

    return res.json({ token });
  } catch (err) {
    console.error("Error al regenerar token:", err);
    res.status(500).json({ error: "Error al regenerar token" });
  }
});

// ---------------------------------------------
// EXPORT DEFAULT (LO QUE TU SERVER NECESITA)
// ---------------------------------------------
export default router;