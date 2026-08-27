/*
  Warnings:

  - Added the required column `batchId` to the `stock_audit_details` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StockInReason" AS ENUM ('PURCHASE', 'RETURN', 'INITIAL_STOCK', 'ADJUSTMENT_AUDIT', 'OTHER');

-- CreateEnum
CREATE TYPE "StockBatchType" AS ENUM ('PURCHASE', 'RETURN', 'INITIAL_STOCK', 'ADJUSTMENT', 'OTHER');

-- AlterEnum
ALTER TYPE "StockOutReason" ADD VALUE 'ADJUSTMENT_AUDIT';

-- AlterTable
ALTER TABLE "stock_audit_details" ADD COLUMN     "batchId" TEXT NOT NULL,
ADD COLUMN     "unitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "stock_in_transactions" (
    "id" TEXT NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "supplierId" TEXT,
    "createdById" TEXT NOT NULL,
    "reason" "StockInReason" NOT NULL,
    "batchType" "StockBatchType" NOT NULL DEFAULT 'PURCHASE',
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "itemId" TEXT,
    "purchaseOrderId" TEXT,

    CONSTRAINT "stock_in_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_in_transaction_items" (
    "id" TEXT NOT NULL,
    "stockInId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_in_transaction_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_out_transactions" (
    "id" TEXT NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "reason" "StockOutReason" NOT NULL,
    "batchType" "StockBatchType" NOT NULL DEFAULT 'OTHER',
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "itemId" TEXT,

    CONSTRAINT "stock_out_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_out_transaction_items" (
    "id" TEXT NOT NULL,
    "stockOutId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_out_transaction_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_in_transactions_referenceNo_key" ON "stock_in_transactions"("referenceNo");

-- CreateIndex
CREATE INDEX "stock_in_transactions_createdAt_idx" ON "stock_in_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "stock_in_transactions_supplierId_idx" ON "stock_in_transactions"("supplierId");

-- CreateIndex
CREATE INDEX "stock_in_transaction_items_stockInId_idx" ON "stock_in_transaction_items"("stockInId");

-- CreateIndex
CREATE INDEX "stock_in_transaction_items_itemId_idx" ON "stock_in_transaction_items"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "stock_out_transactions_referenceNo_key" ON "stock_out_transactions"("referenceNo");

-- CreateIndex
CREATE INDEX "stock_out_transactions_createdAt_idx" ON "stock_out_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "stock_out_transaction_items_stockOutId_idx" ON "stock_out_transaction_items"("stockOutId");

-- CreateIndex
CREATE INDEX "stock_out_transaction_items_itemId_idx" ON "stock_out_transaction_items"("itemId");

-- AddForeignKey
ALTER TABLE "stock_in_transactions" ADD CONSTRAINT "stock_in_transactions_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_in_transactions" ADD CONSTRAINT "stock_in_transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_in_transactions" ADD CONSTRAINT "stock_in_transactions_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_in_transactions" ADD CONSTRAINT "stock_in_transactions_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_in_transaction_items" ADD CONSTRAINT "stock_in_transaction_items_stockInId_fkey" FOREIGN KEY ("stockInId") REFERENCES "stock_in_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_in_transaction_items" ADD CONSTRAINT "stock_in_transaction_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_in_transaction_items" ADD CONSTRAINT "stock_in_transaction_items_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_out_transactions" ADD CONSTRAINT "stock_out_transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_out_transactions" ADD CONSTRAINT "stock_out_transactions_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_out_transaction_items" ADD CONSTRAINT "stock_out_transaction_items_stockOutId_fkey" FOREIGN KEY ("stockOutId") REFERENCES "stock_out_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_out_transaction_items" ADD CONSTRAINT "stock_out_transaction_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_out_transaction_items" ADD CONSTRAINT "stock_out_transaction_items_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_audit_details" ADD CONSTRAINT "stock_audit_details_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
