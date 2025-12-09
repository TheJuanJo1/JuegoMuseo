-- CreateTable
CREATE TABLE "public"."Registros_Sistema" (
    "id_registro" SERIAL NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_usuario" INTEGER NOT NULL,
    "nombre_usuario" TEXT,
    "empresa" TEXT,
    "tipo_documento" TEXT,
    "numero_documento" TEXT,
    "accion" TEXT NOT NULL,
    "resultado" TEXT NOT NULL,
    "mensaje" TEXT,

    CONSTRAINT "Registros_Sistema_pkey" PRIMARY KEY ("id_registro")
);

-- AddForeignKey
ALTER TABLE "public"."Registros_Sistema" ADD CONSTRAINT "Registros_Sistema_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
