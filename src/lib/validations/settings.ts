import { z } from "zod";

export const IdentitySchema = z.object({
  fullName: z.string().min(1, { message: "Nama lengkap wajib diisi." }),
  email: z.string().email({ message: "Format email tidak valid." }),
  phone: z.string().optional(),
  noSIPA: z.string().optional(),
});

export const AvatarSchema = z.object({
  avatarUrl: z.string().url({ message: "URL avatar tidak valid." }),
});

export const PasswordSchema = z
  .object({
    passwordSekarang: z
      .string()
      .min(1, { message: "Password saat ini wajib diisi." }),
    passwordBaru: z
      .string()
      .min(8, { message: "Password baru minimal 8 karakter." }),
    passwordKonfirmasi: z
      .string()
      .min(1, { message: "Konfirmasi password wajib diisi." }),
  })
  .refine((data) => data.passwordBaru === data.passwordKonfirmasi, {
    message: "Konfirmasi password tidak cocok.",
    path: ["passwordKonfirmasi"],
  });

export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: T;
};
