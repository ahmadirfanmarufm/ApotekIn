import React from 'react';

export function InventoryHealthCard() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 font-inter">
                    Inventory Health
                </h3>

                {/* Lingkaran Indikator Persentase */}
                <div className="flex flex-col items-center justify-center my-2">
                    <div className="relative w-28 h-28 rounded-full border-8 border-green-100 flex items-center justify-center border-t-[#22C55E]">
                        <div className="text-center">
                            <span className="text-2xl font-bold font-manrope text-slate-900">85%</span>
                            <p className="text-xs font-semibold text-[#22C55E]">Stable</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistik Bawah (Total SKUs & Critical) */}
            <div className="grid grid-cols-2 pt-4 border-t border-slate-100 text-center mt-4">
                <div>
                    <p className="text-lg font-bold font-manrope text-slate-900">1.2k</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total SKUs</p>
                </div>
                <div>
                    <p className="text-lg font-bold font-manrope text-red-500">14</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Critical</p>
                </div>
            </div>
        </div>
    );
}