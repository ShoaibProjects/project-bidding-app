/*
  Warnings:

  - Added the required column `projectId` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "projectId" TEXT NOT NULL;
