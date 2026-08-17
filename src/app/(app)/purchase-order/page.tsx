'use client';

import React, { useState } from 'react';
import { Plus, Filter, Search, Printer, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { POModal } from '@/components/purchase-order/POModal';

export default function PurchaseOrderPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const poData = [
        { id: 1, date: '11/08/2026', no: 'PO-2026-0811', supplier: 'BioPharma Solutions Co.', items: '3 Item', status: 'Pending' },
        { id: 2, date: '11/08/2026', no: 'PO-2026-0811', supplier: 'BioPharma Solutions Co.', items: '3 Item', status: 'Pending' },
        { id: 3, date: '11/08/2026', no: 'PO-2026-0811', supplier: 'BioPharma Solutions Co.', items: '3 Item', status: 'Selesai' },
        { id: 4, date: '11/08/2026', no: 'PO-2026-0811', supplier: 'BioPharma Solutions Co.', items: '3 Item', status: 'Selesai' },
    ];

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Purchase Order (PO)</h1>
                    <p className="text-slate-500 text-sm mt-1">Kelola dan buat Surat Pesanan obat ke Supplier/PBF</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Buat PO Baru
                </button>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filter:
                    </span>
                    <select className="border border-slate-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[150px]">
                        <option>Semua Status</option>
                        <option>Pending</option>
                        <option>Selesai</option>
                    </select>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari No. PO atau Supplier"
                        className="border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <table className="w-full text-left flex-1">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-xs font-bold text-slate-600">
                            <th className="p-5 text-center">Tanggal PO</th>
                            <th className="p-5">No. PO</th>
                            <th className="p-5">Supplier</th>
                            <th className="p-5">Jumlah Item</th>
                            <th className="p-5 text-center">Status</th>
                            <th className="p-5 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {poData.map((po) => (
                            <tr key={po.id} className="text-sm text-slate-700 hover:bg-slate-50/50 transition-colors">
                                <td className="p-5 text-center">{po.date}</td>
                                <td className="p-5 font-medium">{po.no}</td>
                                <td className="p-5 font-bold text-slate-900">{po.supplier}</td>
                                <td className="p-5">{po.items}</td>
                                <td className="p-5 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${po.status === 'Pending'
                                            ? 'bg-orange-50 text-orange-600 border-orange-200'
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                        }`}>
                                        {po.status}
                                    </span>
                                </td>
                                <td className="p-5 text-center flex justify-center">
                                    <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                                        {po.status === 'Pending' ? (
                                            <>
                                                <Printer className="h-4 w-4" /> Cetak SP
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="h-4 w-4" /> Detail
                                            </>
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="p-5 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500 font-medium">
                    <p>Menampilkan 1-10 dari 42 PO</p>
                    <div className="flex items-center gap-1">
                        <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded bg-emerald-500 text-white font-bold">1</button>
                        <button className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100">2</button>
                        <button className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100">3</button>
                        <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <POModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}