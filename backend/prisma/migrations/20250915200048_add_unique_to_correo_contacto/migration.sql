/*
  Warnings:

  - A unique constraint covering the columns `[correo_contacto]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_correo_contacto_key" ON "public"."Usuarios"("correo_contacto");
