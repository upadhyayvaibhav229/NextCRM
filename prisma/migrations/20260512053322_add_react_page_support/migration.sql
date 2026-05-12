/*
  Warnings:

  - You are about to drop the column `featuredImage` on the `Page` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Page" DROP COLUMN "featuredImage",
ADD COLUMN     "jsxCode" TEXT,
ADD COLUMN     "pageType" TEXT NOT NULL DEFAULT 'html';
