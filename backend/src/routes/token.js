import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Clave secreta (desde .env)
const JWT_SECRET = process.env.JWT_SECRET || "CLAVE_SUPER_SECRETA";

// Tiempo de expiración del token (opcional, configurable)
const TOKEN_EXPIRES = "7d";

// ---------------------------------------------
// Generar un token
// ---------------------------------------------
export function generateToken(payload) {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
  } catch (error) {
    console.error("Error al generar token:", error);
    return null;
  }
}

// ---------------------------------------------
// Verificar un token
// ---------------------------------------------
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("Token inválido:", error);
    return null;
  }
}
