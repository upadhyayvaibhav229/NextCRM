-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "homepagePageId" INTEGER,
ADD COLUMN     "homepageType" TEXT NOT NULL DEFAULT 'posts',
ADD COLUMN     "postsPageId" INTEGER;
