/*
  Warnings:

  - A unique constraint covering the columns `[nombre_usuario]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_nombre_usuario_key" ON "public"."Usuarios"("nombre_usuario");
