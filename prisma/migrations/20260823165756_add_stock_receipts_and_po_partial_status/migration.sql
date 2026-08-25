/*
  Warnings:

  - The values [RECEIVED] on the enum `POStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "POStatus_new" AS ENUM ('PENDING', 'PARTIAL', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."purchase_orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "purchase_orders" ALTER COLUMN "status" TYPE "POStatus_new" USING ("status"::text::"POStatus_new");
ALTER TYPE "POStatus" RENAME TO "POStatus_old";
ALTER TYPE "POStatus_new" RENAME TO "POStatus";
DROP TYPE "public"."POStatus_old";
ALTER TABLE "purchase_orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "purchase_order_items" ADD COLUMN     "receivedQty" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "stock_receipts" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "supplierId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_receipt_items" (
    "id" TEXT NOT NULL,
    "stockReceiptId" TEXT NOT NULL,
    "purchaseOrderItemId" TEXT,
    "itemId" TEXT NOT NULL,
    "batchId" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_receipt_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_receipts_receiptNumber_key" ON "stock_receipts"("receiptNumber");

-- CreateIndex
CREATE INDEX "stock_receipts_purchaseOrderId_idx" ON "stock_receipts"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "stock_receipts_supplierId_idx" ON "stock_receipts"("supplierId");

-- CreateIndex
CREATE INDEX "stock_receipt_items_stockReceiptId_idx" ON "stock_receipt_items"("stockReceiptId");

-- CreateIndex
CREATE INDEX "stock_receipt_items_itemId_idx" ON "stock_receipt_items"("itemId");

-- AddForeignKey
ALTER TABLE "stock_receipts" ADD CONSTRAINT "stock_receipts_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_receipts" ADD CONSTRAINT "stock_receipts_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_receipts" ADD CONSTRAINT "stock_receipts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_receipt_items" ADD CONSTRAINT "stock_receipt_items_stockReceiptId_fkey" FOREIGN KEY ("stockReceiptId") REFERENCES "stock_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_receipt_items" ADD CONSTRAINT "stock_receipt_items_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES "purchase_order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_receipt_items" ADD CONSTRAINT "stock_receipt_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
