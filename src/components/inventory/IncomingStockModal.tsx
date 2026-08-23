'use client';

import React, { useState } from 'react';
import { X, Trash2, Plus } from 'lucide-react';

interface IncomingStockModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function IncomingStockModal({ isOpen, onClose }: IncomingStockModalProps) {
    const [items, setItems] = useState([
        { id: 1, name: '', batch: '', expDate: '', qty: 0, unit: 'Gram' }
    ]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-bold text-slate-900">Form Penerimaan Barang PO</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto">

                    <div className="grid grid-cols-3 gap-6 p-5 border border-slate-200 rounded-xl bg-white">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600">Filter:</label>
                            <select className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option>-- Pilih PO --</option>
                                <option>PO-2026-0811</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600">Nomor Faktur / Surat Jalan</label>
                            <input
                                type="text"
                                placeholder="Contoh: INV/2026/08/001"
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600">Tanggal Masuk</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900">List Barang Diterima</h3>
                            <button className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 flex items-center gap-1">
                                <Plus className="h-4 w-4" /> Tambah Item
                            </button>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600">
                                    <tr>
                                        <th className="p-4 w-1/3">Pilih Barang</th>
                                        <th className="p-4">No. Batch</th>
                                        <th className="p-4">Exp Date</th>
                                        <th className="p-4">Qty</th>
                                        <th className="p-4 text-center w-16">#</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((item) => (
                                        <tr key={item.id} className="bg-white">
                                            <td className="p-4">
                                                <select className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                                    <option>Irl</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <input type="text" placeholder="Contoh: PCL-0230-2222" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                            </td>
                                            <td className="p-4">
                                                <input type="date" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex shadow-sm rounded-lg">
                                                    <input type="number" defaultValue={item.qty} className="w-16 border border-slate-200 rounded-l-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 z-10" />
                                                    <span className="bg-slate-50 border-y border-r border-slate-200 text-slate-500 text-sm px-3 py-2.5 rounded-r-lg">
                                                        {item.unit}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-white">
                    <button onClick={onClose} className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                        Batal
                    </button>
                    <button className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors">
                        Simpan Stok Masuk
                    </button>
                </div>
            </div>
        </div>
    );
}