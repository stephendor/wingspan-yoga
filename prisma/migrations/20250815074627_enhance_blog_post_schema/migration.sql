/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `blog_posts` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."BlogPostAccessLevel" AS ENUM ('PUBLIC', 'MEMBERS_ONLY', 'PREMIUM_ONLY', 'RETREAT_ATTENDEES_ONLY', 'MAILCHIMP_SUBSCRIBERS_ONLY');

-- AlterTable
ALTER TABLE "public"."blog_posts" DROP COLUMN "imageUrl",
ADD COLUMN     "accessLevel" "public"."BlogPostAccessLevel" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "contentBlocks" JSONB,
ADD COLUMN     "featuredImage" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ALTER COLUMN "content" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."blog_posts" ADD CONSTRAINT "blog_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
