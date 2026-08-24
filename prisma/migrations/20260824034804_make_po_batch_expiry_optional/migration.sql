-- AlterTable
ALTER TABLE "purchase_order_items" ALTER COLUMN "batchNumber" DROP NOT NULL,
ALTER COLUMN "expiryDate" DROP NOT NULL;
