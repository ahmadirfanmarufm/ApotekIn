export function StockAlertsCard() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-inter">
                    Pemberitahuan Stok
                </h3>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 font-manrope">Insulin Pen</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Stok habis di Cabang B</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 font-manrope">Vitamin C 1000mg</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Kiriman baru telah tiba.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 font-manrope">Lipitor 20mg</h4>
                            <p className="text-xs text-slate-500 mt-0.5">3 kotak kedaluwarsa dalam 15 hari</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}