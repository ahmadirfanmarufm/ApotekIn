"use client";

import React from "react";
import {
  TrendingDown,
  Star,
  Building2,
  Truck,
  ShieldCheck,
} from "lucide-react";

interface SmartSupplierRecommendationsProps {
  onReviewProposal?: (supplierName: string) => void;
  onComparePrices?: (supplierName: string) => void;
  onIntegrateSupplier?: (supplierName: string) => void;
}

export function SmartSupplierRecommendations({
  onReviewProposal,
  onComparePrices,
  onIntegrateSupplier,
}: SmartSupplierRecommendationsProps) {
  const suppliers = [
    {
      id: 1,
      name: "MedGlobal Logistics",
      rating: "4.9",
      tag: "Top Partner",
      description:
        "Offering bulk rebate on cold-chain items. Switch now to save Rp450.000/bulan.",
      actionText: "Tinjauan Proposal",
      actionHandler: onReviewProposal,
      icon: Truck,
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      id: 2,
      name: "BioHealth Solutions",
      rating: "4.7",
      tag: "Reliable",
      description:
        "New generic alternative available for Zyrtec. 30% lower acquisition cost.",
      actionText: "Bandingkan Harga",
      actionHandler: onComparePrices,
      icon: ShieldCheck,
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      id: 3,
      name: "SwiftMeds Dist.",
      rating: "4.5",
      tag: "New Option",
      description:
        "Same-day delivery available for your area. Ideal for urgent stock-outs.",
      actionText: "Pemasok yang Diintegrasikan",
      actionHandler: onIntegrateSupplier,
      icon: Building2,
      iconBg: "bg-indigo-100 text-indigo-600",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-manrope">
            Rekomendasi Cerdas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tarif yang dinegosiasikan oleh AI dan opsi pemasok alternatif.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-100 self-start sm:self-auto">
          <TrendingDown className="h-4 w-4 text-emerald-600" />
          <span>Potensi Penghematan Rata-rata: 12%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {suppliers.map((supplier) => {
          const IconComp = supplier.icon;
          return (
            <div
              key={supplier.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/40 p-5 transition-all hover:border-slate-300 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold ${supplier.iconBg}`}
                  >
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {supplier.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-slate-700">
                        {supplier.rating}
                      </span>
                      <span>({supplier.tag})</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-5">
                  {supplier.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => supplier.actionHandler?.(supplier.name)}
                className="w-full rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 font-semibold text-xs py-2.5 transition-colors text-center cursor-pointer"
              >
                {supplier.actionText}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
