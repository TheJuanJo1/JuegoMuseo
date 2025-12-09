/*
  Warnings:

  - You are about to drop the column `detalle_nota` on the `Usuarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Documentos_XML" ADD COLUMN     "detalle_nota" TEXT;

-- AlterTable
ALTER TABLE "public"."Usuarios" DROP COLUMN "detalle_nota";
