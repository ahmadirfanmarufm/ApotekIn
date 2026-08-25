"use client";

import React from "react";
import { Sparkles, MoreHorizontal } from "lucide-react";

export function InventoryHealthSection() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Indeks Kesehatan Mingguan: 94%</span>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <h2 className="text-xl font-bold text-slate-900 font-manrope mb-5">
          Inventory Health Summary
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="rounded-xl bg-violet-50/70 p-3.5 border border-violet-100">
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Revenue Optimization
            </p>
            <p className="text-base font-bold text-slate-900">
              +12.4%{" "}
              <span className="text-xs font-normal text-slate-500">vs LW</span>
            </p>
            <div className="mt-2.5 h-1.5 w-full rounded-full bg-violet-100 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[75%]" />
            </div>
          </div>

          <div className="rounded-xl bg-blue-50/70 p-3.5 border border-blue-100">
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Waste Reduction
            </p>
            <p className="text-base font-bold text-slate-900">
              -4.2%{" "}
              <span className="text-xs font-normal text-slate-500">vs LW</span>
            </p>
            <div className="mt-2.5 h-1.5 w-full rounded-full bg-blue-100 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-[60%]" />
            </div>
          </div>

          <div className="rounded-xl bg-indigo-50/70 p-3.5 border border-indigo-100">
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Customer Fulfillment
            </p>
            <p className="text-base font-bold text-slate-900">
              98.2%{" "}
              <span className="text-xs font-normal text-slate-500">
                Target met
              </span>
            </p>
            <div className="mt-2.5 h-1.5 w-full rounded-full bg-indigo-100 overflow-hidden">
              <div className="h-full bg-indigo-700 rounded-full w-[98%]" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-emerald-50/80 p-4 border border-emerald-100 text-sm text-slate-800 leading-relaxed font-medium">
        <span className="font-bold text-emerald-800">Wawasan AI: </span>
        Tingkat perputaran stok Anda meningkat sebesar 15% minggu ini.{" "}
        <span className="font-bold text-emerald-900">
          Kami menyarankan peningkatan frekuensi pemesanan untuk produk
          analgesik dengan pergerakan cepat guna mempertahankan momentum ini
          tanpa menyebabkan penumpukan stok berlebih.
        </span>
      </div>
    </div>
  );
}
