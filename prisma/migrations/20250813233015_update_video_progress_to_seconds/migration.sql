/*
  Warnings:

  - You are about to alter the column `progress` on the `video_progress` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- CreateEnum
CREATE TYPE "public"."RetreatPaymentStatus" AS ENUM ('PENDING', 'DEPOSIT_PAID', 'PAID_IN_FULL', 'CANCELLED', 'REFUNDED');

-- AlterTable
ALTER TABLE "public"."payments" ADD COLUMN     "retreatBookingId" TEXT;

-- AlterTable
ALTER TABLE "public"."video_progress" ALTER COLUMN "progress" SET DEFAULT 0,
ALTER COLUMN "progress" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "public"."retreats" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "depositPrice" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "images" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retreats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."retreat_bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "retreatId" TEXT NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "amountPaid" INTEGER NOT NULL DEFAULT 0,
    "paymentStatus" "public"."RetreatPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "depositPaidAt" TIMESTAMP(3),
    "balanceDueDate" TIMESTAMP(3) NOT NULL,
    "finalPaidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retreat_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "retreats_slug_key" ON "public"."retreats"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "retreat_bookings_userId_retreatId_key" ON "public"."retreat_bookings"("userId", "retreatId");

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_retreatBookingId_fkey" FOREIGN KEY ("retreatBookingId") REFERENCES "public"."retreat_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."retreat_bookings" ADD CONSTRAINT "retreat_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."retreat_bookings" ADD CONSTRAINT "retreat_bookings_retreatId_fkey" FOREIGN KEY ("retreatId") REFERENCES "public"."retreats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
