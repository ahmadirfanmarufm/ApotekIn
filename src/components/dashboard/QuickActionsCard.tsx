import Link from "next/link";
import { ArrowDownToLine, ArrowUpToLine, Receipt, ClipboardCheck } from "lucide-react";

const quickActions = [
    {
        label: "Stock Masuk",
        href: "/inventory/incoming",
        icon: ArrowDownToLine,
    },
    {
        label: "Stock Keluar",
        href: "/inventory/outgoing",
        icon: ArrowUpToLine,
    },
    {
        label: "Purchase Order",
        href: "/purchase-order",
        icon: Receipt,
    },
    {
        label: "Stock Audit",
        href: "/stock-audit",
        icon: ClipboardCheck,
    },
];

export function QuickActionsCard() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-3 h-full">
                {quickActions.map(({ label, href, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-green-50 hover:border-green-200 transition-all group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:text-[#22C55E] mb-2">
                            <Icon size={16} strokeWidth={2} />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}