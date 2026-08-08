export function RevenueChartCard() {
    return (
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-lg font-bold font-manrope text-slate-900">Pendapatan dan Pengeluaran</h2>
                    <p className="text-sm text-slate-500 mt-1">keuangan 30 hari terakhir</p>
                </div>
                <div className="flex gap-4 text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#22C55E]"></span> Pendapatan
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span> Pengeluaran
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-end justify-between gap-2 mt-4 pt-4 border-b border-slate-100 pb-2">
                <div className="flex gap-1 items-end h-40">
                    <div className="w-8 md:w-12 bg-blue-100 rounded-t-sm h-[40%] hover:bg-blue-200 transition-colors"></div>
                    <div className="w-8 md:w-12 bg-[#22C55E] rounded-t-sm h-[30%] hover:bg-green-400 transition-colors"></div>
                </div>
                <div className="flex gap-1 items-end h-40">
                    <div className="w-8 md:w-12 bg-blue-100 rounded-t-sm h-[60%] hover:bg-blue-200 transition-colors"></div>
                    <div className="w-8 md:w-12 bg-[#22C55E] rounded-t-sm h-[85%] hover:bg-green-400 transition-colors"></div>
                </div>
                <div className="flex gap-1 items-end h-40">
                    <div className="w-8 md:w-12 bg-blue-100 rounded-t-sm h-[45%] hover:bg-blue-200 transition-colors"></div>
                    <div className="w-8 md:w-12 bg-[#22C55E] rounded-t-sm h-[35%] hover:bg-green-400 transition-colors"></div>
                </div>
                <div className="flex gap-1 items-end h-40">
                    <div className="w-8 md:w-12 bg-blue-100 rounded-t-sm h-[70%] hover:bg-blue-200 transition-colors"></div>
                    <div className="w-8 md:w-12 bg-[#22C55E] rounded-t-sm h-[90%] hover:bg-green-400 transition-colors"></div>
                </div>
            </div>

            <div className="flex justify-between text-xs text-slate-400 font-medium pt-3">
                <span>Oct 01</span>
                <span>Oct 10</span>
                <span>Oct 20</span>
                <span>Oct 30</span>
            </div>

        </div>
    );
}