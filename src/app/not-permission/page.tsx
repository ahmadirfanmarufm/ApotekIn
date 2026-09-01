"use client";

import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";

export default function NotPermissionPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                        <ShieldX className="h-10 w-10 text-red-500" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                    Akses Ditolak
                </h1>

                <h2 className="text-xl font-semibold text-slate-700 mb-3">
                    Anda tidak memiliki permission
                </h2>

                <p className="text-slate-500 mb-8">
                    Anda tidak memiliki hak akses untuk membuka halaman ini.
                    Silakan hubungi administrator jika Anda membutuhkan akses.
                </p>

                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center justify-center bg-emerald-500 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                    Kembali
                </button>
            </div>
        </div>
    );
}