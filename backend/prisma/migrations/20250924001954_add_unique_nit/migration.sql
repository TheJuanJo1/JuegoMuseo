/*
  Warnings:

  - A unique constraint covering the columns `[nit_empresa]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_nit_empresa_key" ON "public"."Usuarios"("nit_empresa");
