import React from 'react';

export function ActiveSuppliersCard() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-inter">
                    Pemasok Aktif
                </h3>

                <div className="space-y-3">
                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="13" x="4" y="5" rx="2" /><path d="M16 2v3" /><path d="M8 2v3" /><path d="M4 10h16" /></svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">GlobalMed</h4>
                                <span className="inline-block bg-green-100 text-[#22C55E] text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">ON TIME</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="13" x="4" y="5" rx="2" /><path d="M16 2v3" /><path d="M8 2v3" /><path d="M4 10h16" /></svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">PharmaCo</h4>
                                <span className="inline-block bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">DELAYED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}