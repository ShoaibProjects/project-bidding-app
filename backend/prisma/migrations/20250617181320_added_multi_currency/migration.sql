-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'INR', 'GBP', 'CAD', 'AUD', 'JPY');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "budgetCurrency" "Currency" NOT NULL DEFAULT 'USD';
