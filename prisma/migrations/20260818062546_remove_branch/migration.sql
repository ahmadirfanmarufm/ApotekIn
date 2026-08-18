/*
  Warnings:

  - You are about to drop the column `branchId` on the `ai_insights` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `purchase_orders` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `stock_audits` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `stock_outs` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `branches` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ai_insights" DROP CONSTRAINT "ai_insights_branchId_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_branchId_fkey";

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_branchId_fkey";

-- DropForeignKey
ALTER TABLE "stock_audits" DROP CONSTRAINT "stock_audits_branchId_fkey";

-- DropForeignKey
ALTER TABLE "stock_outs" DROP CONSTRAINT "stock_outs_branchId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_branchId_fkey";

-- DropIndex
DROP INDEX "ai_insights_branchId_idx";

-- DropIndex
DROP INDEX "items_branchId_idx";

-- DropIndex
DROP INDEX "purchase_orders_branchId_idx";

-- DropIndex
DROP INDEX "stock_audits_branchId_idx";

-- DropIndex
DROP INDEX "stock_outs_branchId_idx";

-- DropIndex
DROP INDEX "users_branchId_idx";

-- AlterTable
ALTER TABLE "ai_insights" DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "items" DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "purchase_orders" DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "stock_audits" DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "stock_outs" DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "branchId",
ADD COLUMN     "noSIPA" TEXT;

-- DropTable
DROP TABLE "branches";
