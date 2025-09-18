-- 1) Renombra la PK en una sentencia aparte
ALTER TABLE "public"."Usuarios"
  RENAME CONSTRAINT "Configuraciones_Firmas_pkey" TO "Usuarios_pkey";

-- 2) Vuelve opcionales los campos
ALTER TABLE "public"."Usuarios"
  ALTER COLUMN "rol_usuario" DROP NOT NULL,
  ALTER COLUMN "prefijo_numeracion" DROP NOT NULL,
  ALTER COLUMN "num_inicial" DROP NOT NULL,
  ALTER COLUMN "num_final" DROP NOT NULL,
  ALTER COLUMN "certificado_firma" DROP NOT NULL,
  ALTER COLUMN "contrasena_certificado" DROP NOT NULL,
  ALTER COLUMN "token_api" DROP NOT NULL,
  ALTER COLUMN "fecha_expiracion_certificado" DROP NOT NULL;

-- 3) Cambia el tipo de fecha a timestamp(3)
ALTER TABLE "public"."Usuarios"
  ALTER COLUMN "fecha_expiracion_certificado" TYPE TIMESTAMP(3)
  USING "fecha_expiracion_certificado"::timestamp;
