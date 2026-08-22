"use client";

import { useState, FormEvent } from "react";
import { Button } from "../ui/button";
import { ApiResponse } from "@/lib/validations/settings";

export function PasswordCard() {
  const [responseState, setResponseState] = useState<ApiResponse>({
    success: false,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseState({ success: false, message: "" });

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      passwordSekarang: formData.get("passwordSekarang"),
      passwordBaru: formData.get("passwordBaru"),
      passwordKonfirmasi: formData.get("passwordKonfirmasi"),
    };

    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse = await res.json();
      setResponseState(data);

      if (data.success) {
        form.reset();
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

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
    >
      <div className="mb-4 flex flex-row items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Password</h2>
          <p className="text-sm text-slate-500">
            Ubah password akun Anda secara berkala
          </p>
        </div>
        <Button type="submit" disabled={isSubmitting}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="passwordSekarang" className="text-sm font-medium">
            Password Sekarang
          </label>
          <input
            id="passwordSekarang"
            name="passwordSekarang"
            type="password"
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {responseState.errors?.passwordSekarang && (
            <p className="text-xs text-rose-500">
              {responseState.errors.passwordSekarang[0]}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="passwordBaru" className="text-sm font-medium">
            Password Baru
          </label>
          <input
            id="passwordBaru"
            name="passwordBaru"
            type="password"
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {responseState.errors?.passwordBaru && (
            <p className="text-xs text-rose-500">
              {responseState.errors.passwordBaru[0]}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 md:col-start-2">
          <label htmlFor="passwordKonfirmasi" className="text-sm font-medium">
            Konfirmasi Password
          </label>
          <input
            id="passwordKonfirmasi"
            name="passwordKonfirmasi"
            type="password"
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {responseState.errors?.passwordKonfirmasi && (
            <p className="text-xs text-rose-500">
              {responseState.errors.passwordKonfirmasi[0]}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
