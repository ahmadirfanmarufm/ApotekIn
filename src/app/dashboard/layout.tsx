import React from 'react';
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="ml-64 p-8 pt-24">
                    {children}
                </main>
            </div>
        </div>
    );
}