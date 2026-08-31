import { ReportsClient } from "@/components/reports/ReportsClient";

export default function ReportsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 pb-6 sm:space-y-5 sm:pb-8 lg:space-y-6 lg:pb-10">
      <div className="print:hidden">
        <h1 className="font-manrope text-xl font-bold text-slate-950 sm:text-2xl lg:text-3xl">
          Laporan & Analisis
        </h1>

        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
          Pantau performa inventaris, pergerakan stok, dan efisiensi operasional
          apotek.
        </p>
      </div>

      <ReportsClient />
    </div>
  );
}