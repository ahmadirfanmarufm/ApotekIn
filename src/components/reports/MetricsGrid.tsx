import React from 'react';

export function MetricsGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <span className="bg-green-100 text-[#22C55E] text-[11px] font-bold px-2 py-0.5 rounded-md">+14.2%</span>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Pendapatan</p>
                    <h3 className="text-xl font-bold font-manrope text-slate-900 mt-1">Rp124.500.000</h3>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                    <div className="w-9 h-9 rounded-xl bg-green-50 text-[#22C55E] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    </div>
                    <span className="bg-green-100 text-[#22C55E] text-[11px] font-bold px-2 py-0.5 rounded-md">+5.1%</span>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Nilai Pesanan Rata-rata</p>
                    <h3 className="text-xl font-bold font-manrope text-slate-900 mt-1">Rp68.420</h3>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                    </div>
                    <span className="bg-red-100 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-md">-2.4%</span>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Perputaran Persediaan</p>
                    <h3 className="text-xl font-bold font-manrope text-slate-900 mt-1">12.4x</h3>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </div>
                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Low Stock</span>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Barang Kedaluwarsa</p>
                    <h3 className="text-xl font-bold font-manrope text-slate-900 mt-1">12 Units</h3>
                </div>
            </div>

        </div>
    );
}