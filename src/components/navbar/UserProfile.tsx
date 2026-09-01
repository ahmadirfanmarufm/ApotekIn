"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";

export function UserProfile() {
  const { data: session, status } = useSession();

  return (
    <div className="flex items-center gap-2 sm:gap-3 lg:border-l lg:border-slate-200 lg:pl-4 xl:pl-6">
      <div className="hidden text-right md:block">
        <p className="text-sm font-bold text-slate-900 truncate max-w-[140px]">
          {status === "loading"
            ? "Memuat akun..."
            : (session?.user?.name ?? "Pengguna")}
        </p>

        <p className="text-xs text-slate-500 uppercase truncate max-w-[140px]">
          {session?.user?.role ?? "BELUM LOGIN"}
        </p>
      </div>

      <Image
        src={session?.user?.image || "/images/default-avatar.webp"}
        alt="Profile Picture"
        width={40}
        height={40}
        className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover border border-slate-200"
      />
    </div>
  );
}
