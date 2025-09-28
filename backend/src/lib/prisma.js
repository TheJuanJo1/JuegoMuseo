// prisma.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Exportación con nombre
export { prisma };

// Exportación por defecto
export default prisma;