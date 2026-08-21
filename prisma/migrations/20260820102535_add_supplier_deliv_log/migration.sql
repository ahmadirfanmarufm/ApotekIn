/*
  Warnings:

  - You are about to drop the column `aiSummary` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `healthScore` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `leadTimeDays` on the `suppliers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "suppliers" DROP COLUMN "aiSummary",
DROP COLUMN "healthScore",
DROP COLUMN "leadTimeDays",
ADD COLUMN     "Delivered" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "TotalDelivery" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "onDelivery" INTEGER NOT NULL DEFAULT 0;
