-- CreateEnum
CREATE TYPE "public"."MediaAccessLevel" AS ENUM ('PUBLIC', 'MEMBERS_ONLY', 'PRIVATE', 'RETREATS', 'WORKSHOPS', 'INSTRUCTORS_ONLY');

-- AlterTable
ALTER TABLE "public"."media" ADD COLUMN     "accessLevel" "public"."MediaAccessLevel" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "directory" TEXT,
ADD COLUMN     "tags" TEXT[];

-- CreateTable
CREATE TABLE "public"."media_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_categories_name_key" ON "public"."media_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "media_categories_slug_key" ON "public"."media_categories"("slug");

-- AddForeignKey
ALTER TABLE "public"."media" ADD CONSTRAINT "media_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."media_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."media_categories" ADD CONSTRAINT "media_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."media_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
