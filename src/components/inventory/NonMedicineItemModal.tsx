"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Plus, Trash2, Pencil, CalendarDays } from "lucide-react";
import { NonMedicineFormData } from "@/types/inventory";
import { NonMedicineBatchModal } from "./NonMedicineBatchModal";

const emptyForm: NonMedicineFormData = {
  name: "",
  code: "",
  unit: "",
  minStock: "10",
  maxStock: "100",
  description: "",
  imageUrl: "",

  batchNumber: "",
  quantity: "",
  expiryDate: "",
  buyPrice: "",
  sellPrice: "",
};

interface NonMedicineItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: any | null;
}

export function NonMedicineItemModal({
  open,
  onOpenChange,
  item,
}: NonMedicineItemModalProps) {
  const isEdit = Boolean(item);

  const router = useRouter();

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);

  const [form, setForm] = useState<NonMedicineFormData>(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (item) {
      setForm({
        name: item.name ?? "",
        code: item.code ?? "",
        unit: item.unit ?? "",
        minStock: String(item.minStock ?? 10),
        maxStock: String(item.maxStock ?? 100),
        description: item.description ?? "",
        imageUrl: item.imageUrl ?? "",

        batchNumber: "",
        quantity: "",
        expiryDate: "",
        buyPrice: "",
        sellPrice: "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [item, open]);

  const handleSubmit = async () => {
    try {
      if (!form.name.trim()) {
        throw new Error("Nama obat wajib diisi.");
      }

      if (!form.unit.trim()) {
        throw new Error("Satuan obat wajib diisi.");
      }

      if (Number(form.minStock) < 0) {
        throw new Error("Minimum stok tidak boleh negatif.");
      }

      if (Number(form.maxStock) <= Number(form.minStock)) {
        throw new Error("Stok maksimum harus lebih besar dari stok minimum.");
      }

      if (!isEdit) {
        if (!form.batchNumber.trim()) {
          throw new Error("Nomor batch wajib diisi.");
        }

        if (!form.quantity || Number(form.quantity) <= 0) {
          throw new Error("Jumlah stok batch harus lebih dari 0.");
        }

        if (!form.expiryDate) {
          throw new Error("Tanggal kedaluwarsa wajib diisi.");
        }

        if (Number(form.buyPrice) < 0) {
          throw new Error("Harga beli tidak boleh negatif.");
        }

        if (Number(form.sellPrice) < 0) {
          throw new Error("Harga jual tidak boleh negatif.");
        }

        if (Number(form.sellPrice) < Number(form.buyPrice)) {
          throw new Error(
            "Harga jual tidak boleh lebih kecil dari harga beli.",
          );
        }
      }

      const url = isEdit
        ? `/api/inventory/nonmedicine/${item.id}`
        : `/api/inventory/nonmedicine`;

      const method = isEdit ? "PUT" : "POST";

      const body = {
        name: form.name.trim(),
        unit: form.unit.trim(),
        minStock: Number(form.minStock),
        maxStock: Number(form.maxStock),
        description: form.description?.trim() || "",
        imageUrl: form.imageUrl?.trim() || "",

        ...(!isEdit && {
          batch: {
            batchNumber: form.batchNumber.trim(),
            quantity: Number(form.quantity),
            expiryDate: form.expiryDate,
            buyPrice: Number(form.buyPrice),
            sellPrice: Number(form.sellPrice),
          },
        }),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan obat.");
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("NON MEDICINE SUBMIT ERROR:", error);

      alert(error instanceof Error ? error.message : "Terjadi kesalahan.");
    }
  };

  const updateField = (field: keyof NonMedicineFormData, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleAddBatch = () => {
    setSelectedBatch(null);
    setBatchModalOpen(true);
  };

  const handleEditBatch = (batch: any) => {
    setSelectedBatch(batch);
    setBatchModalOpen(true);
  };

  const handleDeleteBatch = async (batchId: string) => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus batch ini?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/inventory/nonmedicine/${item.id}/batches/${batchId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus batch.");
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus batch.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
                    max-h-[90vh]
                    w-[calc(100%-2rem)]
                    max-w-3xl
                    overflow-y-auto
                    rounded-2xl
                    p-0
                "
      >
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="font-manrope text-xl font-bold text-slate-900">
            {isEdit ? "Edit Non Obat" : "Tambah Non Obat"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Perbarui informasi item dan pengaturan stok."
              : "Tambahkan item baru ke inventaris non obat."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6">
          <div>
            <h3 className="mb-4 font-semibold text-slate-900">
              Informasi Obat
            </h3>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nama Obat
                </label>

                <Input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Contoh: Paracetamol 500mg"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Kode Obat
                </label>

                <Input
                  value={form.code ?? "Akan dibuat otomatis"}
                  disabled
                  readOnly
                  className="cursor-not-allowed bg-slate-100 text-slate-500"
                />

                {!isEdit && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Kode obat akan dibuat otomatis oleh sistem.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Satuan
                </label>

                <Input
                  value={form.unit}
                  onChange={(e) => updateField("unit", e.target.value)}
                  placeholder="Strip / Botol / Box"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Minimum Stok
                </label>

                <Input
                  type="number"
                  value={form.minStock}
                  onChange={(e) => updateField("minStock", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Maksimum Stok
                </label>

                <Input
                  type="number"
                  value={form.maxStock}
                  onChange={(e) => updateField("maxStock", e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  URL Foto Obat
                </label>

                <Input
                  value={form.imageUrl}
                  onChange={(e) => updateField("imageUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Deskripsi
                </label>

                <Textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Deskripsi singkat obat..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {!isEdit && (
            <section className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 sm:p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800">Batch Awal</h3>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Masukkan stok batch pertama saat obat dicatat ke dalam sistem.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Nomor Batch
                  </label>

                  <input
                    value={form.batchNumber}
                    onChange={(e) => updateField("batchNumber", e.target.value)}
                    placeholder="BTH-2026-001"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Jumlah Stok
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={(e) => updateField("quantity", e.target.value)}
                      placeholder="100"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-16 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      {form.unit || "unit"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <CalendarDays size={15} />
                    Kedaluwarsa
                  </label>

                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => updateField("expiryDate", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Harga Beli
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.buyPrice}
                    onChange={(e) => updateField("buyPrice", e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Harga Jual
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.sellPrice}
                    onChange={(e) => updateField("sellPrice", e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>
            </section>
          )}

          {isEdit && (
            <div className="border-t border-slate-100 pt-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Batch Obat</h3>

                  <p className="text-sm text-slate-400">
                    Kelola batch dan tanggal kedaluwarsa.
                  </p>
                </div>

                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  onClick={handleAddBatch}
                >
                  <Plus size={16} />
                  Tambah Batch
                </Button>
              </div>

              <div className="space-y-3">
                {item.batches?.length > 0 ? (
                  item.batches.map((batch: any) => (
                    <div
                      key={batch.id}
                      className="
                                                flex flex-col gap-4
                                                rounded-xl
                                                border border-slate-200
                                                bg-slate-50
                                                p-4
                                                sm:flex-row
                                                sm:items-center
                                                sm:justify-between
                                            "
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800">
                          {batch.batchNumber}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Stok:{" "}
                          <span className="font-medium text-slate-700">
                            {batch.quantity} {form.unit}
                          </span>
                        </p>

                        <p className="text-sm text-slate-500">
                          Exp:{" "}
                          {new Date(batch.expiryDate).toLocaleDateString(
                            "id-ID",
                          )}
                        </p>
                      </div>

                      <div className="flex w-full gap-2 sm:w-auto">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none"
                          onClick={() => handleEditBatch(batch)}
                        >
                          <Pencil size={14} />
                          Edit
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteBatch(batch.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
                    <p className="text-sm text-slate-400">
                      Belum ada batch untuk obat ini.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>

          <Button type="button" onClick={handleSubmit}>
            {isEdit ? "Simpan Perubahan" : "Tambah Obat"}
          </Button>
        </div>
      </DialogContent>

      {isEdit && item && (
        <NonMedicineBatchModal
          open={batchModalOpen}
          onOpenChange={setBatchModalOpen}
          itemId={item.id}
          itemUnit={form.unit}
          batch={selectedBatch}
          onSaved={() => {
            setBatchModalOpen(false);
            setSelectedBatch(null);
            router.refresh();
          }}
        />
      )}
    </Dialog>
  );
}
