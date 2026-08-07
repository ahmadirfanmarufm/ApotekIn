import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Sidebar() {
    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen p-6 fixed left-0 top-0 z-20 flex flex-col">

            {/* Bagian Logo ApotekIn (Diperbesar Jauh Lebih Jelas) */}
            <div className="mb-8 px-2 flex items-center">
                <Image
                    src="/images/logo.png"
                    alt="ApotekIn Logo"
                    width={220}
                    height={70}
                    priority
                    className="object-contain w-auto h-14"
                />
            </div>

            {/* Navigasi Menu dengan Ikon */}
            <nav className="space-y-1.5 font-inter flex-1">

                {/* Dashboard */}
                <Link href="/dashboard" className="flex items-center gap-3.5 px-3.5 py-3 bg-green-50 text-[#22C55E] rounded-xl font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                    Dashboard
                </Link>

                {/* Inventory */}
                <Link href="/inventory" className="flex items-center gap-3.5 px-3.5 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                    Inventory
                </Link>

                {/* Supplier */}
                <Link href="/supplier" className="flex items-center gap-3.5 px-3.5 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="13" x="4" y="5" rx="2" /><path d="M16 2v3" /><path d="M8 2v3" /><path d="M4 10h16" /></svg>
                    Supplier
                </Link>

                {/* Stock Audit */}
                <Link href="/stock-audit" className="flex items-center gap-3.5 px-3.5 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /><path d="M12 11h4" /><path d="M12 8h4" /><path d="M8 11h.01" /><path d="M8 8h.01" /></svg>
                    Stock Audit
                </Link>

                {/* AI Insights */}
                <Link href="/ai-insights" className="flex items-center gap-3.5 px-3.5 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" /></svg>
                    AI Insights
                </Link>

                {/* Reports */}
                <Link href="/reports" className="flex items-center gap-3.5 px-3.5 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                    Reports
                </Link>

                {/* User Management */}
                <Link href="/user-management" className="flex items-center gap-3.5 px-3.5 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    User Management
                </Link>

                {/* Settings */}
                <Link href="/settings" className="flex items-center gap-3.5 px-3.5 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1.13 1.57l-.46.25a2 2 0 0 1-2.08-.15l-1.5-1.1a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .3 2.77l1.1 1.4a2 2 0 0 1 .2 2.18v.44a2 2 0 0 1-2 2h-.18a2 2 0 0 0-1.57 1.13l-.25.46a2 2 0 0 0 .15 2.08l1.1 1.5a2 2 0 0 0 .73 2.73l.38.22a2 2 0 0 0 2.77-.3l1.4-1.1a2 2 0 0 1 2.18-.2h.44a2 2 0 0 1 2 2v.18a2 2 0 0 0 1.13 1.57l.46.25a2 2 0 0 0 2.08-.15l1.5-1.1a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.3-2.77l-1.1-1.4a2 2 0 0 1-.2-2.18v-.44a2 2 0 0 1 2-2h.18a2 2 0 0 0 1.57-1.13l.25-.46a2 2 0 0 0-.15-2.08l-1.1-1.5a2 2 0 0 0-.73-2.73l-.38-.22a2 2 0 0 0-2.77.3l-1.4 1.1a2 2 0 0 1-2.18.2z" /><circle cx="12" cy="12" r="3" /></svg>
                    Settings
                </Link>

            </nav>
        </aside>
    );
}