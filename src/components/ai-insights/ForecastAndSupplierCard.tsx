import { CalendarRange, Truck } from "lucide-react";

interface ForecastAndSupplierCardProps {
  forecast: string;
  supplierNote: string | null;
}

export function ForecastAndSupplierCard({ forecast, supplierNote }: ForecastAndSupplierCardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="mb-3 flex items-center gap-2">
          <CalendarRange className="h-5 w-5 shrink-0 text-blue-500" />
          <h3 className="font-manrope text-base font-bold text-slate-900 sm:text-lg">
            Prediksi Periode Mendatang
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{forecast}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Truck className="h-5 w-5 shrink-0 text-violet-500" />
          <h3 className="font-manrope text-base font-bold text-slate-900 sm:text-lg">
            Catatan Supplier
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          {supplierNote ?? "Tidak ada catatan supplier yang perlu disorot saat ini."}
        </p>
      </div>
    </div>
  );
}
