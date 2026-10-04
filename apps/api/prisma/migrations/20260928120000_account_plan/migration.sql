-- CreateEnum
CREATE TYPE "PlanKey" AS ENUM ('free', 'celebration', 'professional');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "plan" "PlanKey" NOT NULL DEFAULT 'free';

