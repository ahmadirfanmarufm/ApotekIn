import React from 'react';

export function AiSummaryCard() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">

            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#22C55E]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold font-manrope text-slate-900">AI Executive Summary</h2>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Kecepatan perputaran inventaris untuk Amoksisilin 500 mg telah meningkat sebesar 22% minggu ini. Dengan tingkat perputaran saat ini, stok yang ada akan cukup untuk <span className="text-[#22C55E] font-semibold">4 hari ke depan</span>.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
                <div className="text-[#22C55E] mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21h6" /><path d="M10 21v-2c0-1.2.9-2.2 2-2.2s2 1 2 2.2v2" /><path d="M15 11c0 2-1 3.5-3 3.5S9 13 9 11s2-3.5 3-3.5 3 1.5 3 3.5z" /><path d="M12 2v2" /><path d="M19.07 4.93l-1.41 1.41" /><path d="M22 12h-2" /><path d="M19.07 19.07l-1.41-1.41" /><path d="M4.93 19.07l1.41-1.41" /><path d="M2 12h2" /><path d="M4.93 4.93l1.41 1.41" />
                    </svg>
                </div>
                <p className="text-sm text-teal-800 leading-relaxed font-medium">
                    Rekomendasi: Pesan ulang 20 unit dari Pemasok GlobalMed hari ini untuk menghindari kehabisan stok pada hari Selasa.
                </p>
            </div>

        </div>
    );
}