import React from 'react';

export function TopUsageCard() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-inter">
                    5 Penggunaan Teratas
                </h3>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-bold text-slate-900 font-manrope">Amoxicillin</span>
                            <span className="text-slate-500 text-xs font-medium">420 units</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#22C55E] h-full rounded-full" style={{ width: '85%' }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-bold text-slate-900 font-manrope">Paracetamol</span>
                            <span className="text-slate-500 text-xs font-medium">380 units</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#22C55E] h-full rounded-full" style={{ width: '70%' }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-bold text-slate-900 font-manrope">Metformin</span>
                            <span className="text-slate-500 text-xs font-medium">290 units</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#22C55E] h-full rounded-full" style={{ width: '50%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}