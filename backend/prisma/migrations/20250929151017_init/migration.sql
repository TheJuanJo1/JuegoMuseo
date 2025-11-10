-- CreateTable
CREATE TABLE "public"."Clientes" (
    "id_cliente" SERIAL NOT NULL,
    "nombre_cliente" TEXT NOT NULL,
    "apellido_cliente" TEXT NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "numero_documento" TEXT NOT NULL,
    "direccion_cliente" TEXT NOT NULL,
    "correo_cliente" TEXT NOT NULL,
    "id_usuario" INTEGER,

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
    "id_documento" SERIAL NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "numero_documento" TEXT NOT NULL,
    "fecha_emision" DATE NOT NULL,
    "valor_total" DECIMAL(15,2) NOT NULL,
    "impuestos" DECIMAL(15,2) NOT NULL,
    "estado_dian" TEXT NOT NULL,
    "codigo_dian" TEXT NOT NULL,
    "mensaje_dian" TEXT NOT NULL,
    "fecha_respuesta_dian" TIMESTAMP(6) NOT NULL,
    "cufe" TEXT,
    "cude" TEXT,
    "xml_archivo" TEXT NOT NULL,
    "pdf_archivo" BYTEA NOT NULL,
    "id_cliente" INTEGER,
    "factura_relacionada" TEXT,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "Documentos_XML_pkey" PRIMARY KEY ("id_documento")
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
    "id_producto" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "iva" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "id_documento" INTEGER NOT NULL,

    CONSTRAINT "Producto_Factura_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "public"."Usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre_usuario" TEXT NOT NULL,
    "rol_usuario" TEXT,
    "contrasena_usuario" TEXT NOT NULL,
    "nit_empresa" TEXT NOT NULL,
    "correo_contacto" TEXT NOT NULL,
    "prefijo_numeracion" INTEGER,
    "num_inicial" INTEGER,
    "num_final" INTEGER,
    "certificado_firma" TEXT,
    "contrasena_certificado" TEXT,
    "token_api" TEXT,
    "fecha_expiracion_certificado" TIMESTAMP(3),

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "public"."PasswordResetToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "public"."Configuracion_Tecnica" (
    "id_configuracion" SERIAL NOT NULL,
    "direccion_empresa" TEXT NOT NULL,
    "prefijo_numeracion" TEXT NOT NULL,
    "numero_inicial" INTEGER NOT NULL,
    "numero_final" INTEGER NOT NULL,
    "regimen_tributario" TEXT NOT NULL,
    "certificado_firma" TEXT NOT NULL,
    "contrasena_cert" TEXT NOT NULL,
    "token_api" TEXT NOT NULL,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "Configuracion_Tecnica_pkey" PRIMARY KEY ("id_configuracion")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_numero_documento_id_usuario_key" ON "public"."Clientes"("numero_documento", "id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_correo_contacto_key" ON "public"."Usuarios"("correo_contacto");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "public"."PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Configuracion_Tecnica_id_usuario_key" ON "public"."Configuracion_Tecnica"("id_usuario");

-- AddForeignKey
ALTER TABLE "public"."Clientes" ADD CONSTRAINT "id_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Configuraciones_Firmas" ADD CONSTRAINT "id_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Documentos_XML" ADD CONSTRAINT "Documentos_XML_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."Clientes"("id_cliente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Documentos_XML" ADD CONSTRAINT "id_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Eventos" ADD CONSTRAINT "id_documento" FOREIGN KEY ("id_documento") REFERENCES "public"."Documentos_XML"("id_documento") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Eventos" ADD CONSTRAINT "id_usuario" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Producto_Factura" ADD CONSTRAINT "Producto_Factura_id_documento_fkey" FOREIGN KEY ("id_documento") REFERENCES "public"."Documentos_XML"("id_documento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Configuracion_Tecnica" ADD CONSTRAINT "Configuracion_Tecnica_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
