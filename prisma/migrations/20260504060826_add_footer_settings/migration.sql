-- AlterTable
CREATE SEQUENCE footersettings_id_seq;
ALTER TABLE "FooterSettings" ALTER COLUMN "id" SET DEFAULT nextval('footersettings_id_seq');
ALTER SEQUENCE footersettings_id_seq OWNED BY "FooterSettings"."id";
