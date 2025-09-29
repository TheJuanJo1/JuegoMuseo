/*
  Warnings:

  - You are about to drop the column `bloqueadoHasta` on the `Usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `intentosFallidos` on the `Usuarios` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Documentos_XML" DROP CONSTRAINT "Documentos_XML_id_usuario_fkey";

-- DropIndex
DROP INDEX "public"."Usuarios_nit_empresa_key";

-- DropIndex
DROP INDEX "public"."Usuarios_nombre_usuario_key";

-- AlterTable
ALTER TABLE "public"."Producto_Factura" RENAME CONSTRAINT "Producto_Factura_id_producto_pkey" TO "id_producto";

-- AlterTable
ALTER TABLE "public"."Usuarios" DROP COLUMN "bloqueadoHasta",
DROP COLUMN "intentosFallidos";

-- AddForeignKey
ALTER TABLE "public"."Documentos_XML" ADD CONSTRAINT "id_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;
