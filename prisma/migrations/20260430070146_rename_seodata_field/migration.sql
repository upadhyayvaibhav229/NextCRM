/*
  Warnings:

  - You are about to drop the column `SeoData` on the `Page` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Page" DROP COLUMN "SeoData",
ADD COLUMN     "seoData" JSONB;
