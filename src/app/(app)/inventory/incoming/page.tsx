'use client';

import React, { useState } from 'react';
import { Plus, Filter, Download, Printer, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { IncomingStockModal } from '@/components/inventory/IncomingStockModal';

export default function IncomingStockPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const stockData = Array(4).fill({
        date: '11/08/2026',
        faktur: 'INV/2026/08/11',
        po: 'PO-2026-0811',
        supplier: 'BioPharma Solutions Co.',
        itemCount: '+43'
    });

    return (
        <div className="space-y-6 relative">

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Stok Masuk</h1>
                    <p className="text-slate-500 text-sm mt-1">Pencatatan penerimaan obat & registrasi batch baru dari supplier.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Tambah Stok Masuk
                </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Total Transaksi Masuk Bulan Ini</p>
                    <h2 className="text-2xl font-bold text-slate-900">42 Transaksi</h2>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Nilai Pembelian (Rp)</p>
                    <h2 className="text-2xl font-bold text-slate-900">Rp2.400.000,-</h2>
                </div>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filter:
                    </span>
                    <select className="border border-slate-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[150px]">
                        <option>Bulan Ini</option>
                    </select>
                    <select className="border border-slate-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[150px]">
                        <option>Pilih Supplier</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                        <Download className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                        <Printer className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <table className="w-full text-left flex-1">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-xs font-bold text-slate-600">
                            <th className="p-5 text-center">Tanggal Masuk</th>
                            <th className="p-5">No. Faktur</th>
                            <th className="p-5">No. PO Referensi</th>
                            <th className="p-5">Supplier</th>
                            <th className="p-5 text-center">Total Item</th>
                            <th className="p-5 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {stockData.map((row, index) => (
                            <tr key={index} className="text-sm text-slate-700 hover:bg-slate-50/50 transition-colors">
                                <td className="p-5 text-center">{row.date}</td>
                                <td className="p-5 font-medium">{row.faktur}</td>
                                <td className="p-5 text-slate-500">{row.po}</td>
                                <td className="p-5 font-bold text-slate-900">{row.supplier}</td>
                                <td className="p-5 text-center font-bold text-emerald-500">{row.itemCount}</td>
                                <td className="p-5 text-center flex justify-center">
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-200">
                                        <Eye className="h-3.5 w-3.5" /> Detail
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="p-5 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500 font-medium">
                    <p>Menampilkan 1-10 dari 42 barang</p>
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

            <IncomingStockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}