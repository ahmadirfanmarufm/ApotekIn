export function QuickActionsCard() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-3 h-full">

                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-green-50 hover:border-green-200 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:text-[#22C55E] mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    </div>
                    <span className="text-xs font-medium text-slate-700">Add Stock</span>
                </button>

                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-green-50 hover:border-green-200 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:text-[#22C55E] mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect width="7" height="7" x="8.5" y="8.5" rx="1" /></svg>
                    </div>
                    <span className="text-xs font-medium text-slate-700">Scan Item</span>
                </button>

                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-green-50 hover:border-green-200 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:text-[#22C55E] mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
                    </div>
                    <span className="text-xs font-medium text-slate-700">Log History</span>
                </button>

                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-green-50 hover:border-green-200 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:text-[#22C55E] mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
                    </div>
                    <span className="text-xs font-medium text-slate-700">Print Label</span>
                </button>

            </div>
        </div>
    );
}