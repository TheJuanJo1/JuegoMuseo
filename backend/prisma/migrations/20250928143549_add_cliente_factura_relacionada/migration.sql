ALTER TABLE "public"."Producto_Factura"
  RENAME CONSTRAINT "Producto_Factura_pkey" TO "Producto_Factura_id_producto_pkey";

ALTER TABLE "public"."Producto_Factura"
  ALTER COLUMN "id_producto" DROP DEFAULT;

ALTER TABLE "public"."Producto_Factura"
  ALTER COLUMN "id_documento" DROP NOT NULL;
