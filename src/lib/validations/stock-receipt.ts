import { z } from "zod";

export const stockReceiptItemSchema = z.object({
  purchaseOrderItemId: z
    .string()
    .min(1, "Item PO wajib dipilih")
    .uuid("Item PO tidak valid"),
  quantity: z
    .number({ message: "Jumlah harus berupa angka" })
    .int("Jumlah harus bilangan bulat")
    .positive("Jumlah harus lebih dari 0"),
  batchNumber: z
    .string()
    .min(1, "Nomor batch wajib diisi")
    .max(100, "Nomor batch maksimal 100 karakter"),
  expiryDate: z
    .string()
    .min(1, "Tanggal kedaluwarsa wajib diisi")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Format tanggal kedaluwarsa tidak valid",
    }),
});

export const createStockReceiptSchema = z.object({
  purchaseOrderId: z
    .string()
    .min(1, "Purchase Order wajib dipilih")
    .uuid("Nomor PO tidak valid"),
  invoiceNumber: z.string().max(100, "Nomor faktur maksimal 100 karakter").optional(),
  notes: z.string().max(2000, "Catatan maksimal 2000 karakter").optional(),
  items: z
    .array(stockReceiptItemSchema)
    .min(1, "Minimal harus ada 1 barang yang diterima"),
});

export type CreateStockReceiptInput = z.infer<typeof createStockReceiptSchema>;
export type StockReceiptItemInput = z.infer<typeof stockReceiptItemSchema>;
