import React from 'react';

export function EfficiencyTable() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold font-manrope text-slate-900">Matriks Efisiensi Produk</h3>
                <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-semibold text-slate-600">
                    <button className="px-3 py-1.5 rounded-lg bg-white shadow-sm text-slate-800">Sehari-hari</button>
                    <button className="px-3 py-1.5 rounded-lg text-[#22C55E]">Bulanan</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <th className="pb-3 font-semibold">Kategori Produk</th>
                            <th className="pb-3 font-semibold">Turnover Rate</th>
                            <th className="pb-3 font-semibold">Efisiensi Stok</th>
                            <th className="pb-3 font-semibold">Volume Bulanan</th>
                            <th className="pb-3 font-semibold">Trend</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">

                        <tr>
                            <td className="py-4 font-bold text-slate-900">Cardiovascular Meds</td>
                            <td className="py-4 text-slate-600">14.5x</td>
                            <td className="py-4">
                                <div className="w-36 bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-[#22C55E] h-full rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </td>
                            <td className="py-4 text-slate-600">2,450 Units</td>
                            <td className="py-4 text-[#22C55E] font-semibold text-xs">↗ +12%</td>
                        </tr>

                        <tr>
                            <td className="py-4 font-bold text-slate-900">Antibiotics</td>
                            <td className="py-4 text-slate-600">9.2x</td>
                            <td className="py-4">
                                <div className="w-36 bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-[#22C55E] h-full rounded-full" style={{ width: '55%' }}></div>
                                </div>
                            </td>
                            <td className="py-4 text-slate-600">1,120 Units</td>
                            <td className="py-4 text-slate-500 font-semibold text-xs">→ 0.5%</td>
                        </tr>

                        <tr>
                            <td className="py-4 font-bold text-slate-900">OTC Supplements</td>
                            <td className="py-4 text-slate-600">21.0x</td>
                            <td className="py-4">
                                <div className="w-36 bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-[#22C55E] h-full rounded-full" style={{ width: '90%' }}></div>
                                </div>
                            </td>
                            <td className="py-4 text-slate-600">5,800 Units</td>
                            <td className="py-4 text-[#22C55E] font-semibold text-xs">↗ +28%</td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </div>
    );
}