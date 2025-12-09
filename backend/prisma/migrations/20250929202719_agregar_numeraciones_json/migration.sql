/*
  Warnings:

  - You are about to drop the column `numero_final` on the `Configuracion_Tecnica` table. All the data in the column will be lost.
  - You are about to drop the column `numero_inicial` on the `Configuracion_Tecnica` table. All the data in the column will be lost.
  - You are about to drop the column `prefijo_numeracion` on the `Configuracion_Tecnica` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Configuracion_Tecnica" DROP COLUMN "numero_final",
DROP COLUMN "numero_inicial",
DROP COLUMN "prefijo_numeracion",
ADD COLUMN     "numeraciones" JSONB NOT NULL DEFAULT '[]';
