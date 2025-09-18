-- CreateTable
CREATE TABLE "public"."codigos_verificacion" (
    "id" SERIAL NOT NULL,
    "correo" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "contrasena_temp" TEXT NOT NULL,
    "nombre_empresa" TEXT NOT NULL,
    "nit_empresa" TEXT NOT NULL,
    "expiracion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "codigos_verificacion_pkey" PRIMARY KEY ("id")
);
