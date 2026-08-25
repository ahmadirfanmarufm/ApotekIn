import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { IdentityCard } from "@/components/settings/IdentityCard";
import { PasswordCard } from "@/components/settings/PasswordCard";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      fullName: true,
      email: true,
      phone: true,
      noSIPA: true,
      role: true,
      avatarUrl: true,
    },
  });

  if (!user) return <div>User tidak ditemukan</div>;

  return (
    <div className="space-y-6 font-inter text-slate-800 relative">
      <div>
        <h1 className="text-2xl font-bold font-manrope text-slate-950">
          Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Kelola identitas dan keamanan Anda.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <IdentityCard
          user={{
            ...user,
            phone: user.phone || "",
            noSIPA: user.noSIPA || "",
            avatarUrl: user.avatarUrl || null,
          }}
        />
        <PasswordCard />
      </div>
    </div>
  );
}
