import React from 'react';

export function ReportsTopSection() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

            <div className="lg:col-span-2 bg-emerald-50/50 rounded-2xl border border-emerald-100 p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#22C55E]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                    </div>
                    <h2 className="text-lg font-bold font-manrope text-slate-900">AI Executive Summary</h2>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                    Kinerja operasional bulan ini berada <span className="text-[#22C55E] font-semibold">12% di atas tolok ukur</span>. Pendapatan telah stabil setelah optimalisasi rantai pasok pada Kuartal 1. Kami melihat adanya peluang signifikan untuk menekan biaya penyimpanan sebesar 8% dengan menyesuaikan tingkat stok antibiotik musiman dengan tingkat pemenuhan pesanan sebesar 99,4%.
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Skor Kesehatan Global</span>
                <div className="relative w-24 h-24 rounded-full border-8 border-green-100 flex items-center justify-center border-t-[#22C55E] my-2">
                    <span className="text-2xl font-bold font-manrope text-slate-900">92%</span>
                </div>
                <p className="text-xs font-semibold text-[#22C55E] flex items-center gap-1">
                    <span>↗</span> +3.4% this week
                </p>
            </div>

        </div>
    );
}