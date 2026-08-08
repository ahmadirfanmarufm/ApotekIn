'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function Sidebar() {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    const NavLink = ({ href, children, icon }: { href: string, children: React.ReactNode, icon: string }) => (
        <Link
            href={href}
            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium transition-colors ${isActive(href) ? 'bg-green-50 text-[#22C55E]' : 'text-slate-600 hover:bg-slate-50'}`}
        >
            <span dangerouslySetInnerHTML={{ __html: icon }} />
            {children}
        </Link>
    );

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen p-6 fixed left-0 top-0 z-20 flex flex-col">
            <div className="mb-10 mt-2 px-2 flex items-center justify-start">
                <Image
                    src="/images/logo.png"
                    alt="ApotekIn"
                    width={220}
                    height={70}
                    priority
                    className="w-44 h-auto object-contain"
                />
            </div>

            <nav className="space-y-1.5 flex-1">
                <NavLink href="/dashboard" icon='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>'>
                    Dashboard
                </NavLink>

                <NavLink href="/reports" icon='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>'>
                    Reports
                </NavLink>
            </nav>
        </aside>
    );
}