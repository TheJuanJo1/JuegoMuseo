// backend/src/lib/prisma.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Export por defecto
export default prisma;

// Export nombrado
export { prisma };
