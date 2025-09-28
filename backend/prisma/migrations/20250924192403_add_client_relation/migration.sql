/*
  Warnings:

  - Made the column `id_documento` on table `Producto_Factura` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Documentos_XML" DROP CONSTRAINT "id_usuario";

-- AlterTable
ALTER TABLE "public"."Documentos_XML" ADD COLUMN     "id_cliente" INTEGER;

-- AlterTable
ALTER TABLE "public"."Producto_Factura" ALTER COLUMN "id_documento" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Documentos_XML" ADD CONSTRAINT "Documentos_XML_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Documentos_XML" ADD CONSTRAINT "Documentos_XML_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."Clientes"("id_cliente") ON DELETE SET NULL ON UPDATE CASCADE;
