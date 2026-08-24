import { z } from "zod";

export const purchaseOrderItemSchema = z.object({
  itemId: z.string().min(1, "Barang wajib dipilih"),
  quantity: z
    .number({ message: "Jumlah harus berupa angka" })
    .int("Jumlah harus bilangan bulat")
    .positive("Jumlah harus lebih dari 0"),
  unitPrice: z
    .number({ message: "Harga satuan harus berupa angka" })
    .nonnegative("Harga satuan tidak boleh negatif"),
});

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Supplier wajib dipilih"),
  notes: z.string().max(2000, "Catatan maksimal 2000 karakter").optional(),
  items: z
    .array(purchaseOrderItemSchema)
    .min(1, "Minimal harus ada 1 barang dalam PO"),
});

export type CreatePurchaseOrderInput = z.infer<
  typeof createPurchaseOrderSchema
>;
export type PurchaseOrderItemInput = z.infer<typeof purchaseOrderItemSchema>;
