"use client";

import { useRef, useState, useTransition, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "../ui/button";
import Image from "next/image";
import { ApiResponse } from "@/lib/validations/settings";
import Swal from "sweetalert2";

type IdentityCardProps = {
  user: {
    fullName: string;
    email: string;
    phone: string;
    noSIPA: string;
    role: string;
    avatarUrl: string | null;
  };
};

export function IdentityCard({ user }: IdentityCardProps) {
  const { update } = useSession();
  const router = useRouter();

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(
    user.avatarUrl,
  );
  const [responseState, setResponseState] = useState<ApiResponse>({
    success: false,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleIdentitySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseState({ success: false, message: "" });

    const formData = new FormData(e.currentTarget);
    const payload = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      noSIPA: formData.get("noSIPA"),
    };

    try {
      const res = await fetch("/api/settings/identity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse = await res.json();
      setResponseState(data);

      if (data.success) {
        await update({
          user: { name: payload.fullName as string },
        });
        router.refresh();
      }
    } catch {
      setResponseState({
        success: false,
        message: "Terjadi kesalahan koneksi ke server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setResponseState({
        success: false,
        message: "File harus berupa gambar.",
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setResponseState({
        success: false,
        message: "Ukuran gambar maksimal 2MB.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, { cacheControl: "3600", upsert: true });

        if (error) {
          console.error("Supabase Upload Error:", error);
          setResponseState({
            success: false,
            message: "Gagal mengunggah foto ke Supabase Storage.",
          });
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;

        const res = await fetch("/api/settings/avatar", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: publicUrl }),
        });

        const data: ApiResponse = await res.json();
        setResponseState(data);

        if (!data.success) return;

        setCurrentAvatarUrl(publicUrl);

        await update({
          user: { image: publicUrl },
        });

        router.refresh();
      } catch (err) {
        console.error("Upload error:", err);
        setResponseState({
          success: false,
          message: "Terjadi kesalahan saat mengunggah foto.",
        });
      }
    });
  };

  const handleRemovePhoto = async () => {
    const result = await Swal.fire({
      title: "Hapus foto profil?",
      text: "Apakah Anda yakin ingin menghapus foto profil?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/settings/avatar", {
          method: "DELETE",
        });

        const fileName = currentAvatarUrl?.split("/").at(-1);
        const filePath = `avatars/${fileName}`;

        console.log("File name to remove:", fileName);
        console.log("File path to remove:", filePath);

        const data: ApiResponse = await res.json();
        setResponseState(data);

        if (!data.success) {
          await Swal.fire({
            title: "Gagal",
            text: data.message || "Gagal menghapus foto profil.",
            icon: "error",
            confirmButtonText: "OK",
          });

          return;
        }

        await supabase.storage.from("avatars").remove([filePath]);

        setCurrentAvatarUrl(null);

        await update({
          user: {
            image: null,
          },
        });

        await Swal.fire({
          title: "Berhasil",
          text: "Foto profil berhasil dihapus.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        router.refresh();
      } catch (err) {
        console.error("Remove error:", err);

        setResponseState({
          success: false,
          message: "Terjadi kesalahan saat menghapus foto.",
        });

        await Swal.fire({
          title: "Terjadi kesalahan",
          text: "Terjadi kesalahan saat menghapus foto.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    });
  };

  return (
    <form
      onSubmit={handleIdentitySubmit}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
    >
      <div className="mb-4 flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold">Identitas Anda</h2>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      {responseState.message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            responseState.success
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {responseState.message}
        </div>
      )}

      <div className="flex gap-4 items-center">
        <div className="relative w-25 h-25 overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 shrink-0">
          <Image
            src={currentAvatarUrl || "/images/no-avatar.webp"}
            alt="Profile Image"
            fill
            className="object-cover"
            unoptimized={!!currentAvatarUrl}
          />
        </div>

        <div className="flex flex-col justify-center gap-2">
          <h3 className="text-sm font-bold">{user.fullName}</h3>
          <p className="text-sm text-slate-500">{user.email}</p>

          <div className="flex flex-row gap-4 items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={handleSelectFile}
              disabled={isUploading}
              className="text-emerald-600 text-sm font-medium hover:underline disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? "Mengunggah..." : "Ganti Foto"}
            </button>

            {currentAvatarUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isUploading}
                className="text-rose-500 text-sm font-medium hover:underline disabled:opacity-50 cursor-pointer"
              >
                Hapus Foto
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="my-8 text-slate-200">
        <hr />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            Nama Lengkap
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            defaultValue={user.fullName}
            required
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {responseState.errors?.fullName && (
            <p className="text-xs text-rose-500">
              {responseState.errors.fullName[0]}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={user.email}
            required
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {responseState.errors?.email && (
            <p className="text-xs text-rose-500">
              {responseState.errors.email[0]}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-medium">
            No. HP
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={user.phone}
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="noSIPA" className="text-sm font-medium">
            No. SIPA
          </label>
          <input
            id="noSIPA"
            name="noSIPA"
            type="text"
            defaultValue={user.noSIPA}
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </form>
  );
}
