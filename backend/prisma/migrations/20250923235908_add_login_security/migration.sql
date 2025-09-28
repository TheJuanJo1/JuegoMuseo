-- AlterTable
ALTER TABLE "public"."Usuarios" ADD COLUMN     "bloqueadoHasta" TIMESTAMP(3),
ADD COLUMN     "intentosFallidos" INTEGER NOT NULL DEFAULT 0;
