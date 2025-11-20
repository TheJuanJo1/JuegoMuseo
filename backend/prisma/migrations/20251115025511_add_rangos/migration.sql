-- CreateTable
CREATE TABLE "public"."Rangos" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "inicio" INTEGER NOT NULL,
    "fin" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "Rangos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Rangos" ADD CONSTRAINT "Rangos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
