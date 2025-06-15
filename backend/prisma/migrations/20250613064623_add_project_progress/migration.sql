-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProjectStatus" ADD VALUE 'IN_REVIEW';
ALTER TYPE "ProjectStatus" ADD VALUE 'CHANGES_REQUESTED';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;
