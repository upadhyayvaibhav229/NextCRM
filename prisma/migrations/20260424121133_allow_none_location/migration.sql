-- DropIndex
DROP INDEX "Menu_location_key";

-- AlterTable
ALTER TABLE "Menu" ALTER COLUMN "location" SET DEFAULT 'none';
