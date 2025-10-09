import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

// Simulación de BD en memoria
const tokensGuardados = {};

// GET: obtener token existente o generar uno nuevo
router.get("/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    if (tokensGuardados[usuarioId]) {
      return res.json({ token: tokensGuardados[usuarioId] });
    }

    const token = jwt.sign(
      { sub: usuarioId },
      process.env.JWT_SECRET || "mi_secreto",
      { expiresIn: "1h" }
    );

    tokensGuardados[usuarioId] = token;

    return res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar token" });
  }
});

// POST: regenerar token
router.post("/regenerar/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const token = jwt.sign(
      { sub: usuarioId },
      process.env.JWT_SECRET || "mi_secreto",
      { expiresIn: "1h" }
    );

    tokensGuardados[usuarioId] = token;

    return res.json({ token });
  } catch (error) {
    console.error("Error al regenerar token:", error);
    res.status(500).json({ error: "Error al regenerar token" });
  }
});

export default router;
