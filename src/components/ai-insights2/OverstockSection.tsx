"use client";

import { Package, Thermometer, Container } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OverstockSectionProps {
  onApplyDiscount?: (itemName: string) => void;
  onReturnToSupplier?: (itemName: string) => void;
}

export function OverstockSection({
  onApplyDiscount,
  onReturnToSupplier,
}: OverstockSectionProps) {
  const overstockItems = [
    {
      id: 1,
      name: "Digital Thermometer X-2",
      status: "Dead Stock: 45 Days",
      actionText: "Apply 15% Discount",
      actionType: "discount",
      icon: Thermometer,
    },
    {
      id: 2,
      name: "Organic Hand Cream",
      status: "Over-ordered: 20 units",
      actionText: "Pengembalian ke Pemasok",
      actionType: "return",
      icon: Container,
    },
  ];

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-blue-100 bg-blue-50/20 p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Optimalisasi Kelebihan Stok
            </h2>
          </div>
          <Badge className="bg-blue-600 text-white font-bold px-2.5 py-0.5 rounded-full text-xs">
            7 Item
          </Badge>
        </div>

        <div className="space-y-3 mb-6">
          {overstockItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {item.status}
                  </p>
                </div>
              </div>

              {item.actionType === "discount" ? (
                <button
                  type="button"
                  onClick={() => onApplyDiscount?.(item.name)}
                  className="rounded-lg border border-blue-400 bg-white hover:bg-blue-50 text-blue-600 font-semibold text-xs px-3 py-2 transition-colors cursor-pointer"
                >
                  {item.actionText}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onReturnToSupplier?.(item.name)}
                  className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-2 transition-colors cursor-pointer"
                >
                  {item.actionText}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-blue-100 pt-3 text-center">
        <p className="text-xs italic text-slate-500 font-medium">
          Estimasi pemulihan modal:{" "}
          <span className="font-bold text-slate-700 font-manrope">Rp1.450.000</span>
        </p>
      </div>
    </div>
  );
}
