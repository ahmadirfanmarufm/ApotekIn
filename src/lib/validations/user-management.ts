import { z } from "zod";

export const RoleEnum = z.enum([
  "ADMINISTRATOR",
  "APOTEKER_PENANGGUNG_JAWAB",
  "TENAGA_TEKNIS_KEFARMASIAN",
  "ADMIN_LOGISTIK",
  "OWNER",
]);

export const CreateUserSchema = z
  .object({
    fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
    email: z.string().email("Format email tidak valid"),
    noSIPA: z.string().optional(),
    phone: z.string().optional(),
    role: RoleEnum,
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z
      .string()
      .min(6, "Konfirmasi password minimal 6 karakter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const UpdateUserSchema = z
  .object({
    fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
    email: z.string().email("Format email tidak valid"),
    noSIPA: z.string().optional(),
    phone: z.string().optional(),
    role: RoleEnum,
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Konfirmasi password tidak cocok",
      path: ["confirmPassword"],
    },
  );

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
