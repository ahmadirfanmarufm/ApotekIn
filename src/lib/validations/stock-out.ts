import { z } from "zod";

export const stockOutReasons = [
  "SALE",
  "EXPIRED",
  "DAMAGED",
  "REFUND",
  "RETURN_TO_SUPPLIER",
  "OTHER",
] as const;

export const stockOutItemSchema = z.object({
  batchId: z.string().min(1, "Batch wajib dipilih").uuid("Batch tidak valid"),
  quantity: z
    .number({ message: "Jumlah harus berupa angka" })
    .int("Jumlah harus bilangan bulat")
    .positive("Jumlah harus lebih dari 0"),
});

export const createStockOutSchema = z
  .object({
    reason: z.enum(stockOutReasons, {
      message: "Alasan pengeluaran stok tidak valid",
    }),
    notes: z.string().max(2000, "Catatan maksimal 2000 karakter").optional(),
    items: z
      .array(stockOutItemSchema)
      .min(1, "Minimal harus ada 1 barang yang dikeluarkan"),
  })
  .refine((data) => data.reason !== "OTHER" || Boolean(data.notes?.trim()), {
    message: "Catatan wajib diisi ketika alasan pengeluaran adalah 'Lainnya'.",
    path: ["notes"],
  });

export type CreateStockOutInput = z.infer<typeof createStockOutSchema>;
export type StockOutItemInput = z.infer<typeof stockOutItemSchema>;
