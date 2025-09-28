CREATE SEQUENCE "public".producto_factura_id_producto_seq;
ALTER TABLE "public"."Producto_Factura" 
  ALTER COLUMN "id_producto" SET DEFAULT nextval('"public".producto_factura_id_producto_seq');
