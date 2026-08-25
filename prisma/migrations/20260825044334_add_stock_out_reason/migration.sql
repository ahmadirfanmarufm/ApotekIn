-- CreateEnum
CREATE TYPE "StockOutReason" AS ENUM ('SALE', 'EXPIRED', 'DAMAGED', 'REFUND', 'RETURN_TO_SUPPLIER', 'OTHER');

-- AlterTable
ALTER TABLE "stock_outs" ADD COLUMN     "reason" "StockOutReason" NOT NULL DEFAULT 'SALE';

-- CreateIndex
CREATE INDEX "stock_outs_reason_idx" ON "stock_outs"("reason");

-- CreateIndex
CREATE INDEX "stock_outs_createdAt_idx" ON "stock_outs"("createdAt");
