import React from 'react';

export function PrioritiesList() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold font-manrope text-slate-900">Prioritas Hari Ini</h2>
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    4 Mendesak
                </span>
            </div>

            {/* Daftar Tugas */}
            <div className="flex flex-col gap-3 flex-1">

                {/* Item 1 */}
                <div className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300 text-[#22C55E] focus:ring-[#22C55E] cursor-pointer" />
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-700">Audit Narkotika Bulanan</h4>
                        <p className="text-xs text-slate-500 mt-1">Harus diserahkan paling lambat pukul 17.00</p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600">⋮</button>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300 text-[#22C55E] focus:ring-[#22C55E] cursor-pointer" />
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-700">Membuang Parasetamol Kedaluwarsa</h4>
                        <p className="text-xs text-red-500 font-medium mt-1">Terlambat 2 jam</p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600">⋮</button>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300 text-[#22C55E] focus:ring-[#22C55E] cursor-pointer" />
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-700">Pengisian Ulang: Perlengkapan Diabetes</h4>
                        <p className="text-xs text-slate-500 mt-1">Pengambilan Gudang #12</p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600">⋮</button>
                </div>

            </div>

            {/* Footer / Tombol Lihat Semua */}
            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <a href="#" className="text-sm font-semibold text-[#22C55E] hover:text-green-700">Manage All Tasks</a>
            </div>

        </div>
    );
}