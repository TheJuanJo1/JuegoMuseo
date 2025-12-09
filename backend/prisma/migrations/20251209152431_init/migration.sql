-- CreateTable
CREATE TABLE "Clientes" (
    "id_cliente" SERIAL NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "numero_documento" TEXT NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "id_usuario" INTEGER,
    "razon_social" TEXT,
    "correo_cliente" TEXT,
    "telefono" TEXT,
    "direccion_cliente" TEXT,
    "ciudad" TEXT,
    "departamento" TEXT,

    CONSTRAINT "Clientes_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "Documentos_XML" (
    "id_documento" SERIAL NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "numero_documento" TEXT NOT NULL,
    "numero_serie" TEXT,
    "prefijo" TEXT,
    "consecutivo_completo" TEXT,
    "fecha_emision" TIMESTAMP(3) NOT NULL,
    "subtotal" DECIMAL(15,2),
    "descuentos" DECIMAL(15,2),
    "valor_total" DECIMAL(15,2) NOT NULL,
    "impuestos" DECIMAL(15,2) NOT NULL,
    "moneda" TEXT,
    "forma_pago" TEXT,
    "metodo_pago" TEXT,
    "xml_archivo" TEXT NOT NULL,
    "pdf_archivo" TEXT,
    "cufe" TEXT,
    "cude" TEXT,
    "xml_json" JSONB,
    "id_cliente" INTEGER,
    "id_rango" INTEGER,
    "nombre_cliente" TEXT,
    "razon_social_cliente" TEXT,
    "correo_cliente" TEXT,
    "telefono_cliente" TEXT,
    "direccion_cliente" TEXT,
    "ciudad_cliente" TEXT,
    "departamento_cliente" TEXT,
    "mensajes_dian" JSONB,
    "estado_dian" TEXT DEFAULT 'Pendiente',
    "numero_factura" INTEGER,
    "medio_pago" TEXT,
    "fecha_vencimiento" TIMESTAMP(3),
    "tipo_operacion" TEXT,
    "razon_social_emisor" TEXT,
    "nombre_comercial_emisor" TEXT,
    "nit_emisor" TEXT,
    "tipo_contribuyente_emisor" TEXT,
    "regimen_fiscal_emisor" TEXT,
    "responsabilidad_tributaria_emisor" TEXT,
    "actividad_economica_emisor" TEXT,
    "pais_emisor" TEXT,
    "departamento_emisor" TEXT,
    "ciudad_emisor" TEXT,
    "direccion_emisor" TEXT,
    "telefono_emisor" TEXT,
    "correo_emisor" TEXT,
    "documento_relacionado" INTEGER,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "Documentos_XML_pkey" PRIMARY KEY ("id_documento")
);

-- CreateTable
CREATE TABLE "Eventos" (
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
CREATE TABLE "Producto_Factura" (
    "id_producto" SERIAL NOT NULL,
    "codigo" TEXT,
    "descripcion" TEXT NOT NULL,
    "unidad_medida" TEXT,
    "cantidad" DECIMAL(15,2) NOT NULL,
    "precio_unitario" DECIMAL(15,2) NOT NULL,
    "iva" DECIMAL(15,2) NOT NULL,
    "total" DECIMAL(15,2) NOT NULL,
    "codigo_estandar" TEXT,
    "tipo_impuesto" TEXT,
    "id_documento" INTEGER NOT NULL,

    CONSTRAINT "Producto_Factura_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "Usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre_usuario" TEXT NOT NULL,
    "rol_usuario" TEXT,
    "contrasena_usuario" TEXT NOT NULL,
    "nit_empresa" TEXT NOT NULL,
    "correo_contacto" TEXT NOT NULL,
    "direccion_empresa" TEXT NOT NULL,
    "regimen_tributario" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codigos_verificacion" (
    "id" SERIAL NOT NULL,
    "correo" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "contrasena_temp" TEXT NOT NULL,
    "nombre_empresa" TEXT NOT NULL,
    "nit_empresa" TEXT NOT NULL,
    "direccion_empresa" TEXT,
    "regimen_tributario" TEXT,
    "expiracion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "codigos_verificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registros_Sistema" (
    "id_registro" SERIAL NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_usuario" INTEGER NOT NULL,
    "nombre_usuario" TEXT,
    "empresa" TEXT,
    "tipo_documento" TEXT,
    "numero_documento" TEXT,
    "numero_serie" TEXT,
    "accion" TEXT NOT NULL,
    "resultado" TEXT NOT NULL,
    "mensaje" TEXT,

    CONSTRAINT "Registros_Sistema_pkey" PRIMARY KEY ("id_registro")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_nombre_usuario_key" ON "Usuarios"("nombre_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_nit_empresa_key" ON "Usuarios"("nit_empresa");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_correo_contacto_key" ON "Usuarios"("correo_contacto");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_direccion_empresa_key" ON "Usuarios"("direccion_empresa");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- AddForeignKey
ALTER TABLE "Clientes" ADD CONSTRAINT "Clientes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentos_XML" ADD CONSTRAINT "Documentos_XML_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Clientes"("id_cliente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentos_XML" ADD CONSTRAINT "Documentos_XML_documento_relacionado_fkey" FOREIGN KEY ("documento_relacionado") REFERENCES "Documentos_XML"("id_documento") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentos_XML" ADD CONSTRAINT "Documentos_XML_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eventos" ADD CONSTRAINT "id_documento" FOREIGN KEY ("id_documento") REFERENCES "Documentos_XML"("id_documento") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Eventos" ADD CONSTRAINT "id_usuario" FOREIGN KEY ("id_usuario") REFERENCES "Usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Producto_Factura" ADD CONSTRAINT "Producto_Factura_id_documento_fkey" FOREIGN KEY ("id_documento") REFERENCES "Documentos_XML"("id_documento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registros_Sistema" ADD CONSTRAINT "Registros_Sistema_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
