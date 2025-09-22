/*
  Warnings:

  - You are about to drop the column `esstado_dian` on the `Documentos_XML` table. All the data in the column will be lost.
  - Added the required column `estado_dian` to the `Documentos_XML` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `valor_total` on the `Documentos_XML` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `impuestos` on the `Documentos_XML` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `precio_unitario` on the `Producto_Factura` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `iva` on the `Producto_Factura` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `total` on the `Producto_Factura` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Documentos_XML" DROP COLUMN "esstado_dian",
ADD COLUMN     "estado_dian" TEXT NOT NULL,
DROP COLUMN "valor_total",
ADD COLUMN     "valor_total" DECIMAL(15,2) NOT NULL,
DROP COLUMN "impuestos",
ADD COLUMN     "impuestos" DECIMAL(15,2) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Producto_Factura" DROP COLUMN "precio_unitario",
ADD COLUMN     "precio_unitario" DECIMAL(15,2) NOT NULL,
DROP COLUMN "iva",
ADD COLUMN     "iva" DECIMAL(5,2) NOT NULL,
DROP COLUMN "total",
ADD COLUMN     "total" DECIMAL(15,2) NOT NULL;
