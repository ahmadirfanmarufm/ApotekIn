import React from 'react';

export function RecentActivityCard() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full relative">

            {/* Tombol Plus Hijau di Pojok Kanan Bawah Sesuai Desain Figma */}
            <div className="absolute bottom-6 right-6 w-10 h-10 bg-[#22C55E] hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
            </div>

            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-inter">
                    Aktivitas Terkini
                </h3>

                {/* Timeline List */}
                <div className="space-y-4 relative border-l-2 border-slate-100 ml-2 pl-4">

                    {/* Aktivitas 1 */}
                    <div className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#22C55E] ring-4 ring-white"></span>
                        <h4 className="text-xs font-bold text-slate-900">Audit Selesai</h4>
                        <p className="text-[11px] text-slate-500">by Admin John • 10m ago</p>
                    </div>

                    {/* Aktivitas 2 */}
                    <div className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></span>
                        <h4 className="text-xs font-bold text-slate-900">Pengiriman Diterima</h4>
                        <p className="text-[11px] text-slate-500">320 units Panadol • 1h ago</p>
                    </div>

                    {/* Aktivitas 3 */}
                    <div className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></span>
                        <h4 className="text-xs font-bold text-slate-900">Pemasok Baru Ditambahkan</h4>
                        <p className="text-[11px] text-slate-500">MedX Logistics • 3h ago</p>
                    </div>

                </div>
            </div>
        </div>
    );
}