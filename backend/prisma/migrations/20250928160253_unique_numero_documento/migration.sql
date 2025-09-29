/*
  Warnings:

  - A unique constraint covering the columns `[numero_documento,id_usuario]` on the table `Clientes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Clientes_numero_documento_id_usuario_key" ON "public"."Clientes"("numero_documento", "id_usuario");
