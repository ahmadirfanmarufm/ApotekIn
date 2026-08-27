import { z } from "zod";

export const initiateAuditSchema = z.object({
  notes: z.string().max(5000, "Catatan maksimal 5000 karakter").optional(),
});

export const auditItemSchema = z.object({
  itemId: z.string().uuid("Item tidak valid"),
  batchId: z.string().uuid("Batch tidak valid"),
  systemStock: z
    .number({ message: "Stok sistem harus berupa angka" })
    .int("Stok sistem harus bilangan bulat")
    .nonnegative("Stok sistem tidak boleh negatif"),
  physicalStock: z
    .number({ message: "Stok fisik harus berupa angka" })
    .int("Stok fisik harus bilangan bulat")
    .nonnegative("Stok fisik tidak boleh negatif"),
  unitPrice: z
    .number({ message: "Harga harus berupa angka" })
    .nonnegative("Harga tidak boleh negatif")
    .optional(),
  reason: z.string().max(2000, "Catatan maksimal 2000 karakter").optional(),
});

export const recordAuditSchema = z.object({
  auditId: z.string().uuid("Audit tidak valid"),
  items: z.array(auditItemSchema).min(1, "Minimal 1 batch harus dicatat"),
});

export const approveAuditSchema = z.object({
  auditId: z.string().uuid("Audit tidak valid"),
  notes: z.string().max(5000, "Catatan maksimal 5000 karakter").optional(),
});

export type InitiateAuditInput = z.infer<typeof initiateAuditSchema>;
export type RecordAuditInput = z.infer<typeof recordAuditSchema>;
export type ApproveAuditInput = z.infer<typeof approveAuditSchema>;
