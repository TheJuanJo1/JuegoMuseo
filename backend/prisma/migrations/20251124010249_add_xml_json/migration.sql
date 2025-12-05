/*
  Warnings:

  - You are about to drop the column `apellido_cliente` on the `Clientes` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_cliente` on the `Clientes` table. All the data in the column will be lost.
  - You are about to drop the column `codigo_dian` on the `Documentos_XML` table. All the data in the column will be lost.
  - You are about to drop the column `detalle_nota` on the `Documentos_XML` table. All the data in the column will be lost.
  - You are about to drop the column `estado_dian` on the `Documentos_XML` table. All the data in the column will be lost.
  - You are about to drop the column `factura_relacionada` on the `Documentos_XML` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_respuesta_dian` on the `Documentos_XML` table. All the data in the column will be lost.
  - You are about to drop the column `mensaje_dian` on the `Documentos_XML` table. All the data in the column will be lost.
  - You are about to alter the column `precio_unitario` on the `Producto_Factura` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `iva` on the `Producto_Factura` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `total` on the `Producto_Factura` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to drop the column `certificado_firma` on the `Usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `contrasena_certificado` on the `Usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_expiracion_certificado` on the `Usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `num_final` on the `Usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `num_inicial` on the `Usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `prefijo_numeracion` on the `Usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `token_api` on the `Usuarios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numero_documento]` on the table `Clientes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_usuario]` on the table `Configuraciones_Firmas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nombre_completo` to the `Clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prefijo` to the `Rangos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Clientes" DROP CONSTRAINT "id_usuario";

-- DropForeignKey
ALTER TABLE "public"."Documentos_XML" DROP CONSTRAINT "id_usuario";

-- DropIndex
DROP INDEX "public"."Clientes_numero_documento_id_usuario_key";

-- AlterTable
ALTER TABLE "public"."Clientes" DROP COLUMN "apellido_cliente",
DROP COLUMN "nombre_cliente",
ADD COLUMN     "ciudad" TEXT,
ADD COLUMN     "departamento" TEXT,
ADD COLUMN     "nombre_completo" TEXT NOT NULL,
ADD COLUMN     "razon_social" TEXT,
ADD COLUMN     "telefono" TEXT,
ALTER COLUMN "direccion_cliente" DROP NOT NULL,
ALTER COLUMN "correo_cliente" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Configuracion_Tecnica" ALTER COLUMN "direccion_empresa" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Documentos_XML" DROP COLUMN "codigo_dian",
DROP COLUMN "detalle_nota",
DROP COLUMN "estado_dian",
DROP COLUMN "factura_relacionada",
DROP COLUMN "fecha_respuesta_dian",
DROP COLUMN "mensaje_dian",
ADD COLUMN     "consecutivo_completo" TEXT,
ADD COLUMN     "descuentos" DECIMAL(15,2),
ADD COLUMN     "documento_relacionado" INTEGER,
ADD COLUMN     "forma_pago" TEXT,
ADD COLUMN     "id_rango" INTEGER,
ADD COLUMN     "metodo_pago" TEXT,
ADD COLUMN     "moneda" TEXT,
ADD COLUMN     "subtotal" DECIMAL(15,2),
ADD COLUMN     "xml_json" JSONB,
ALTER COLUMN "fecha_emision" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "pdf_archivo" DROP NOT NULL,
ALTER COLUMN "pdf_archivo" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Producto_Factura" ADD COLUMN     "codigo" TEXT,
ADD COLUMN     "codigo_estandar" TEXT,
ADD COLUMN     "tipo_impuesto" TEXT,
ADD COLUMN     "unidad_medida" TEXT,
ALTER COLUMN "cantidad" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "precio_unitario" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "iva" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "public"."Rangos" ADD COLUMN     "fecha_desde" TIMESTAMP(3),
ADD COLUMN     "fecha_hasta" TIMESTAMP(3),
ADD COLUMN     "prefijo" TEXT NOT NULL,
ADD COLUMN     "resolucion" TEXT;

-- AlterTable
ALTER TABLE "public"."Usuarios" DROP COLUMN "certificado_firma",
DROP COLUMN "contrasena_certificado",
DROP COLUMN "fecha_expiracion_certificado",
DROP COLUMN "num_final",
DROP COLUMN "num_inicial",
DROP COLUMN "prefijo_numeracion",
DROP COLUMN "token_api";

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_numero_documento_key" ON "public"."Clientes"("numero_documento");

-- CreateIndex
CREATE UNIQUE INDEX "Configuraciones_Firmas_id_usuario_key" ON "public"."Configuraciones_Firmas"("id_usuario");

-- AddForeignKey
ALTER TABLE "public"."Clientes" ADD CONSTRAINT "Clientes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Documentos_XML" ADD CONSTRAINT "Documentos_XML_documento_relacionado_fkey" FOREIGN KEY ("documento_relacionado") REFERENCES "public"."Documentos_XML"("id_documento") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Documentos_XML" ADD CONSTRAINT "Documentos_XML_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
