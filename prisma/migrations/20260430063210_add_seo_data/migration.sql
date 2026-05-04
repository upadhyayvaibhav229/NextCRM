/*
  Warnings:

  - You are about to drop the column `seoDescription` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `seoTitle` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "seoDescription",
DROP COLUMN "seoTitle",
ADD COLUMN     "seoData" JSONB;
