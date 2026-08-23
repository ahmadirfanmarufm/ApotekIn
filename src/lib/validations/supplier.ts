import { z } from "zod";

export const SupplierSchema = z.object({
  code: z
    .string()
    .min(1, "Kode supplier wajib diisi")
    .max(20, "Kode supplier maksimal 20 karakter"),
  name: z.string().min(2, "Nama supplier minimal 2 karakter"),
  phone: z.string().min(1, "Nomor telepon wajib diisi"),
  contactPerson: z.string().optional(),
  email: z
    .union([z.string().email("Format email tidak valid"), z.literal("")])
    .optional(),
  address: z.string().optional(),
});

export type SupplierInput = z.infer<typeof SupplierSchema>;
