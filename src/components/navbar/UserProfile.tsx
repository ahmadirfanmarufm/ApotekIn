"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";

export function UserProfile() {
  const { data: session, status } = useSession();

  return (
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
        className="h-10 w-10 rounded-full object-cover"
      />
    </div>
  );
}