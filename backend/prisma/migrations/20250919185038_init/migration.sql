-- AlterTable
CREATE SEQUENCE "public".documentos_xml_id_documento_seq;

ALTER TABLE "public"."Documentos_XML" 
  RENAME CONSTRAINT "id_documento" TO "Documentos_XML_pkey";

ALTER TABLE "public"."Documentos_XML"
  ALTER COLUMN "id_documento" SET DEFAULT nextval('"public".documentos_xml_id_documento_seq');

ALTER SEQUENCE "public".documentos_xml_id_documento_seq 
  OWNED BY "public"."Documentos_XML"."id_documento";
