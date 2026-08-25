"use client";

import React, { useState } from "react";
import { Calendar, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiInsightsHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AiInsightsHeader({
  onRefresh,
  isRefreshing = false,
}: AiInsightsHeaderProps) {
  const [selectedRange, setSelectedRange] = useState("7 Hari Terakhir");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const ranges = [
    "7 Hari Terakhir",
    "30 Hari Terakhir",
    "Bulan Ini",
    "Kuartal Ini",
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-manrope">
          Umum Apotek Cerdas
        </h1>
        <p className="mt-1 text-slate-500">
          Analisis waktu nyata dan optimalisasi prediktif untuk jaringan apotek
          Anda
        </p>
      </div>

      <div className="flex items-center gap-3">
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>{selectedRange}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 z-30 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              {ranges.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => {
                    setSelectedRange(range);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors ${
                    selectedRange === range
                      ? "text-emerald-600 font-semibold bg-emerald-50/50"
                      : "text-slate-700"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>

        
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-5 py-2 font-semibold shadow-sm gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>{isRefreshing ? "Memperbarui..." : "Refresh Data"}</span>
        </Button>
      </div>
    </div>
  );
}
