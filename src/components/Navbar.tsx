import React from 'react';

export function Navbar() {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 ml-64 fixed top-0 right-0 left-0 z-10">
            <div className="flex items-center">
                <input
                    type="search"
                    placeholder="Cari data, inventaris, atau resep..."
                    className="bg-slate-100 px-4 py-2 rounded-lg w-80 text-sm border-none focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">Dr. Sarah Khalil</p>
                    <p className="text-xs text-slate-500">MANAJER FARMASI</p>
                </div>
            </div>
        </header>
    );
}