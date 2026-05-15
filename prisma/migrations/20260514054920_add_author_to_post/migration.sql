-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "authorId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
