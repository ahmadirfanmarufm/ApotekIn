import React from 'react';

export function AnalyticsSection() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold font-manrope text-slate-900">Trend Inventaris</h3>
                    </div>
                    <div className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 flex items-center gap-2 cursor-pointer">
                        Last 6 Months <span>▼</span>
                    </div>
                </div>

                <div className="h-48 border-b border-slate-100 flex items-end justify-between px-4 pb-2 relative">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                        <div className="border-b border-slate-100 w-full"></div>
                        <div className="border-b border-slate-100 w-full"></div>
                        <div className="border-b border-slate-100 w-full"></div>
                    </div>
                    <div className="w-12 bg-blue-100/60 rounded-t h-[40%]"></div>
                    <div className="w-12 bg-blue-100/60 rounded-t h-[55%]"></div>
                    <div className="w-12 bg-blue-100/60 rounded-t h-[45%]"></div>
                    <div className="w-12 bg-blue-100/60 rounded-t h-[70%]"></div>
                    <div className="w-12 bg-blue-100/60 rounded-t h-[60%]"></div>
                    <div className="w-12 bg-[#22C55E]/80 rounded-t h-[85%]"></div>
                </div>

                <div className="flex justify-between text-xs text-slate-400 font-medium pt-3 px-2">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                </div>

                <div className="flex gap-6 text-xs font-medium text-slate-600 mt-4 pt-2">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-400"></span> Revenue</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#22C55E]"></span> Expenses</div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold font-manrope text-slate-900">Keandalan Pemasok</h3>
                    <button className="text-slate-400 hover:text-slate-600 font-bold">⋮</button>
                </div>
                <p className="text-xs text-slate-400 mb-4">Perbandingan kinerja berdasarkan waktu tunggu dan kualitas</p>

                <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-800">BioPharma Global</span>
                            <p className="text-[11px] text-slate-400">Fulfillment: 99.4%</p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-bold text-slate-900">2.1 Days</span>
                            <p className="text-[10px] text-slate-400">Avg. Lead Time</p>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-800">MedSupply Inc.</span>
                            <p className="text-[11px] text-slate-400">Fulfillment: 94.2%</p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-bold text-slate-900">3.8 Days</span>
                            <p className="text-[10px] text-slate-400">Avg. Lead Time</p>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-800">HealthSource Co.</span>
                            <p className="text-[11px] text-slate-400">Fulfillment: 88.7%</p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-bold text-red-500">5.4 Days</span>
                            <p className="text-[10px] text-slate-400">Avg. Lead Time</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}