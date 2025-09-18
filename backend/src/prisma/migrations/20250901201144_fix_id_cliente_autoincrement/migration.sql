-- CreateTable
CREATE TABLE "public"."Clientes" (
    "id_cliente" SERIAL NOT NULL,
    "nombre_cliente" TEXT NOT NULL,
    "apellido_cliente" TEXT NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "numero_documento" TEXT NOT NULL,
    "direccion_cliente" TEXT NOT NULL,
    "correo_cliente" TEXT NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "Clientes_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "public"."Configuraciones_Firmas" (
    "id_config" INTEGER NOT NULL,
    "ruta" TEXT NOT NULL,
    "certificado" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "firma" TEXT NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "id_config" PRIMARY KEY ("id_config")
);

-- CreateTable
CREATE TABLE "public"."Documentos_XML" (
    "id_documento" INTEGER NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "numero_documento" TEXT NOT NULL,
    "fecha_emision" DATE NOT NULL,
    "valor_total" DECIMAL(15,2)[],
    "impuestos" DECIMAL(15,2)[],
    "esstado_dian" TEXT NOT NULL,
    "codigo_dian" TEXT NOT NULL,
    "mensaje_dian" TEXT NOT NULL,
    "fecha_respuesta_dian" TIMESTAMP(6) NOT NULL,
    "cufe" TEXT NOT NULL,
    "cude" TEXT NOT NULL,
    "xml_archivo" TEXT NOT NULL,
    "pdf_archivo" BYTEA NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "id_documento" PRIMARY KEY ("id_documento")
);

-- CreateTable
CREATE TABLE "public"."Eventos" (
    "id_evento" INTEGER NOT NULL,
    "tipo_evento" TEXT NOT NULL,
    "fecha_hora" TIMESTAMP(6) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "resultado" TEXT NOT NULL,
    "id_documento" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "id_evento" PRIMARY KEY ("id_evento")
);

-- CreateTable
CREATE TABLE "public"."Producto_Factura" (
    "id_producto" INTEGER NOT NULL,
    "descripcion" TEXT,
    "cantidad" INTEGER,
    "precio_unitario" DECIMAL(15,2)[],
    "iva" DECIMAL(5,2)[],
    "total" DECIMAL(15,2)[],
    "id_documento" INTEGER,

    CONSTRAINT "id_producto" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "public"."Usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre_usuario" TEXT NOT NULL,
    "rol_usuario" TEXT NOT NULL,
    "contrasena_usuario" TEXT NOT NULL,
    "nit_empresa" TEXT NOT NULL,
    "correo_contacto" TEXT NOT NULL,
    "prefijo_numeracion" INTEGER NOT NULL,
    "num_inicial" INTEGER NOT NULL,
    "num_final" INTEGER NOT NULL,
    "certificado_firma" TEXT NOT NULL,
    "contrasena_certificado" TEXT NOT NULL,
    "token_api" TEXT NOT NULL,
    "fecha_expiracion_certificado" DATE NOT NULL,

    CONSTRAINT "Configuraciones_Firmas_pkey" PRIMARY KEY ("id_usuario")
);

-- AddForeignKey
ALTER TABLE "public"."Clientes" ADD CONSTRAINT "id_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Configuraciones_Firmas" ADD CONSTRAINT "id_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Documentos_XML" ADD CONSTRAINT "id_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Eventos" ADD CONSTRAINT "id_documento" FOREIGN KEY ("id_documento") REFERENCES "public"."Documentos_XML"("id_documento") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Eventos" ADD CONSTRAINT "id_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Producto_Factura" ADD CONSTRAINT "id_documento" FOREIGN KEY ("id_documento") REFERENCES "public"."Documentos_XML"("id_documento") ON DELETE NO ACTION ON UPDATE NO ACTION;
