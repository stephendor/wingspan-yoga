/*
  Warnings:

  - The values [ADMIN] on the enum `MembershipType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[userId,classInstanceId]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `category` on the `classes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."ClassCategory" AS ENUM ('VINYASA', 'HATHA', 'YIN', 'RESTORATIVE', 'MEDITATION', 'BREATHWORK', 'POWER', 'GENTLE', 'WORKSHOP', 'RETREAT', 'BEGINNER_COURSE', 'PRENATAL', 'SENIORS');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."MembershipType_new" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'UNLIMITED');
ALTER TABLE "public"."users" ALTER COLUMN "membershipType" DROP DEFAULT;
ALTER TABLE "public"."videos" ALTER COLUMN "membershipRequired" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "membershipType" TYPE "public"."MembershipType_new" USING ("membershipType"::text::"public"."MembershipType_new");
ALTER TABLE "public"."videos" ALTER COLUMN "membershipRequired" TYPE "public"."MembershipType_new" USING ("membershipRequired"::text::"public"."MembershipType_new");
ALTER TYPE "public"."MembershipType" RENAME TO "MembershipType_old";
ALTER TYPE "public"."MembershipType_new" RENAME TO "MembershipType";
DROP TYPE "public"."MembershipType_old";
ALTER TABLE "public"."users" ALTER COLUMN "membershipType" SET DEFAULT 'FREE';
ALTER TABLE "public"."videos" ALTER COLUMN "membershipRequired" SET DEFAULT 'FREE';
COMMIT;

-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "classInstanceId" TEXT,
ALTER COLUMN "classId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."classes" DROP COLUMN "category",
ADD COLUMN     "category" "public"."ClassCategory" NOT NULL;

-- AlterTable
ALTER TABLE "public"."payments" ADD COLUMN     "classInstanceId" TEXT,
ALTER COLUMN "currency" SET DEFAULT 'gbp';

-- CreateTable
CREATE TABLE "public"."class_templates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "difficulty" "public"."DifficultyLevel" NOT NULL,
    "category" "public"."ClassCategory" NOT NULL,
    "location" "public"."ClassLocation" NOT NULL,
    "meetingUrl" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instructorId" TEXT NOT NULL,

    CONSTRAINT "class_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_instances" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER,
    "price" INTEGER,
    "status" "public"."ClassStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "templateId" TEXT NOT NULL,
    "instructorId" TEXT,

    CONSTRAINT "class_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_exceptions" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "class_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "class_instances_templateId_date_key" ON "public"."class_instances"("templateId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "class_exceptions_templateId_date_key" ON "public"."class_exceptions"("templateId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_userId_classInstanceId_key" ON "public"."bookings"("userId", "classInstanceId");

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_classInstanceId_fkey" FOREIGN KEY ("classInstanceId") REFERENCES "public"."class_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_templates" ADD CONSTRAINT "class_templates_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."instructors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_instances" ADD CONSTRAINT "class_instances_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."class_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_instances" ADD CONSTRAINT "class_instances_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_exceptions" ADD CONSTRAINT "class_exceptions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."class_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_classInstanceId_fkey" FOREIGN KEY ("classInstanceId") REFERENCES "public"."class_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
