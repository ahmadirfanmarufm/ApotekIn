"use client";

import React from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Personnel, EmployeeFormData } from "@/types/employee";

interface EmployeeModalProps {
  isOpen: boolean;
  editingUser: Personnel | null;
  formData: EmployeeFormData;
  formErrors: Record<string, string>;
  isSubmitLoading: boolean;
  onClose: () => void;
  onInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  editingUser,
  formData,
  formErrors,
  isSubmitLoading,
  onClose,
  onInputChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {editingUser ? "Edit Karyawan" : "Registrasi Karyawan"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={onInputChange}
              placeholder="Masukkan nama lengkap"
              autoComplete="name"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {formErrors.fullName && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.fullName}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Email <span className="text-red-500">*</span>
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              placeholder="contoh@apotekin.com"
              autoComplete="email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {formErrors.email && (
              <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Nomor SIPA{" "}
                <span className="font-normal text-slate-400">(Opsional)</span>
              </label>

              <input
                type="text"
                name="noSIPA"
                value={formData.noSIPA}
                onChange={onInputChange}
                placeholder="Nomor SIPA"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Nomor HP{" "}
                <span className="font-normal text-slate-400">(Opsional)</span>
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={onInputChange}
                placeholder="08xxxxxxxxxx"
                autoComplete="tel"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Role / Permission <span className="text-red-500">*</span>
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={onInputChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ADMINISTRATOR">Administrator</option>
              <option value="APOTEKER_PENANGGUNG_JAWAB">
                APJ (Apoteker Penanggung Jawab)
              </option>
              <option value="TENAGA_TEKNIS_KEFARMASIAN">
                TTK (Tenaga Teknis Kefarmasian)
              </option>
              <option value="ADMIN_LOGISTIK">Admin Logistik</option>
              <option value="OWNER">Owner</option>
            </select>

            {formErrors.role && (
              <p className="mt-1 text-xs text-red-500">{formErrors.role}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Password{" "}
                {!editingUser && <span className="text-red-500">*</span>}
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={onInputChange}
                placeholder={
                  editingUser
                    ? "Kosongkan jika tak diubah"
                    : "Minimal 6 karakter"
                }
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {formErrors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.password}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Konfirmasi Password{" "}
                {!editingUser && <span className="text-red-500">*</span>}
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={onInputChange}
                placeholder="Ulangi password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {formErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitLoading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitLoading}
              className="min-w-30 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isSubmitLoading ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : editingUser ? (
                "Simpan Perubahan"
              ) : (
                "Buat Karyawan"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};