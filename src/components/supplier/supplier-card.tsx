"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Phone,
  Package,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Supplier } from "@/types/supplier";
import { deleteSupplier } from "@/app/(app)/supplier/_actions/supplier-actions";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown-menu";

interface SupplierCardProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onRefresh: () => void;
}

export function SupplierCard({
  supplier,
  onEdit,
  onRefresh,
}: SupplierCardProps) {
  const router = useRouter();

  const handleCreatePO = () => {
    router.push(`/purchase-order?supplierId=${supplier.id}&openModal=true`);
  };

  const handleDelete = async () => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${supplier.name}?`)) {
      const res = await deleteSupplier(supplier.id);
      if (res.success) {
        onRefresh();
      } else {
        alert(res.error);
      }
    }
  };

  return (
    <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50">
          <Building2 className="h-6 w-6 text-emerald-700" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-bold text-slate-900">
              {supplier.name}
            </h3>
            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
              {supplier.code}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Phone className="h-3.5 w-3.5" />
            <span>{supplier.phone}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-slate-50 p-2 text-center">
          <div className="text-base font-bold text-blue-600">
            {supplier.onDelivery}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            Out for delivery
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-2 text-center">
          <div className="text-base font-bold text-emerald-600">
            {supplier.Delivered}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">Delivered</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-2 text-center">
          <div className="text-base font-bold text-purple-600">
            {supplier.TotalDelivery}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">Total Order</div>
        </div>
      </div>

      <div className="min-h-15 rounded-xl bg-slate-50/80 p-3.5 text-xs leading-relaxed text-slate-500">
        {supplier.address ? `Alamat: ${supplier.address}` : "Tidak ada alamat."}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button
          size="icon"
          onClick={handleCreatePO}
          className="flex-1 gap-2 border-0 bg-emerald-100/70 font-semibold text-emerald-800 shadow-none hover:bg-emerald-200"
        >
          <Package className="h-4 w-4" />
          Buat PO
        </Button>

        <Dropdown
          trigger={
            <Button
              size="icon"
              className="border-0 w-2 h-2 bg-emerald-100/70 text-emerald-800 shadow-none hover:bg-emerald-200"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
        >
          <DropdownItem onClick={() => onEdit(supplier)}>
            <Pencil className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-slate-700">Edit</span>
          </DropdownItem>
          <DropdownItem
            onClick={handleDelete}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-600" />
            <span>Hapus</span>
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
}
