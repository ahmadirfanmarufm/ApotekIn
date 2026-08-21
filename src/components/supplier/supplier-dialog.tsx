"use client";

import {
  useState,
  ChangeEvent,
  FormEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Supplier,
  SupplierFormData,
} from "@/types/supplier";
import {
  createSupplier,
  updateSupplier,
} from "@/app/(app)/supplier/_actions/supplier-actions";

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierToEdit?: Supplier | null;
  onSuccess?: () => void;
}

const initialFormState: SupplierFormData = {
  code: "",
  name: "",
  phone: "",
  contactPerson: "",
  email: "",
  address: "",
};

function mapSupplierToFormData(
  supplier: Supplier | null | undefined,
): SupplierFormData {
  if (!supplier) {
    return { ...initialFormState };
  }

  return {
    code: supplier.code,
    name: supplier.name,
    phone: supplier.phone,
    contactPerson: supplier.contactPerson ?? "",
    email: supplier.email ?? "",
    address: supplier.address ?? "",
  };
}

export function SupplierDialog({
  open,
  onOpenChange,
  supplierToEdit,
  onSuccess,
}: SupplierDialogProps) {
  const [formData, setFormData] = useState<SupplierFormData>(
    () => mapSupplierToFormData(supplierToEdit),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setFormData(mapSupplierToFormData(supplierToEdit));
    }

    onOpenChange(nextOpen);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = supplierToEdit
        ? await updateSupplier(supplierToEdit.id, formData)
        : await createSupplier(formData);

      if (!res.success) {
        alert(res.error);
        return;
      }

      setFormData({ ...initialFormState });
      onOpenChange(false);
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-125 px-6">
        <DialogHeader>
          <DialogTitle>
            {supplierToEdit
              ? "Edit Supplier"
              : "Tambah Supplier Baru"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 py-2"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                Kode Supplier{" "}
                <span className="text-red-500">*</span>
              </Label>

              <Input
                id="code"
                name="code"
                placeholder="SUP-001"
                value={formData.code}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Nomor Telepon{" "}
                <span className="text-red-500">*</span>
              </Label>

              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+62 812-3456-7890"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Nama Supplier{" "}
              <span className="text-red-500">*</span>
            </Label>

            <Input
              id="name"
              name="name"
              placeholder="PT Pharma Utama"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">
                Contact Person
              </Label>

              <Input
                id="contactPerson"
                name="contactPerson"
                placeholder="John Doe"
                value={formData.contactPerson}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="supplier@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>

            <Textarea
              id="address"
              name="address"
              placeholder="Jl. Raya Utama No. 123"
              rows={3}
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Menyimpan..."
                : supplierToEdit
                  ? "Simpan Perubahan"
                  : "Simpan Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}