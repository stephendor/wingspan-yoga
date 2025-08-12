-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('MEMBER', 'INSTRUCTOR', 'ADMIN');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'MEMBER';
