-- AlterTable
ALTER TABLE "public"."Documentos_XML" ADD COLUMN     "factura_relacionada" TEXT;

-- AlterTable
ALTER TABLE "public"."Producto_Factura" RENAME CONSTRAINT "id_producto" TO "Producto_Factura_pkey";
