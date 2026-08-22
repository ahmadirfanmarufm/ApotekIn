"use client";

import { Search, X } from "lucide-react";

interface SupplierSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function SupplierSearch({ value, onChange }: SupplierSearchProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Cari nama atau kode supplier..."
        aria-label="Cari supplier"
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-9 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Hapus pencarian"
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
