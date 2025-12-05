/*
  Warnings:

  - A unique constraint covering the columns `[id_usuario,tipo]` on the table `Rangos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Rangos_id_usuario_tipo_key" ON "public"."Rangos"("id_usuario", "tipo");
