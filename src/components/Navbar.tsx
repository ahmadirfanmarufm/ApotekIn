"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-10 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Cari data, inventaris, atau resep..."
          className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 w-80 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">
              {status === "loading"
                ? "Memuat akun..."
                : (session?.user?.name ?? "Pengguna")}
            </p>
            <p className="text-xs text-slate-500 uppercase">
              {session?.user?.role ?? "BELUM LOGIN"}
            </p>
          </div>
          <Image
            src={session?.user?.image || "/images/default-avatar.webp"}
            alt="Profile Picture"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
      </div>
    </header>
  );
}
