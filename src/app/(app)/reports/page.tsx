import { ReportsClient } from "@/components/reports/ReportsClient";
import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permission";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const session = await auth();
  
  if (!session?.user?.id || !session.user.role) {
      redirect("/login");
  }

  const permissions = await getUserPermissions(session.user.id, session.user.role);

  if (!permissions.includes("*") && !permissions.includes("reports.view")) {
      redirect("/not-permission");
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 pb-6 sm:space-y-5 sm:pb-8 lg:space-y-6 lg:pb-10">
      <div className="print:hidden">
        <h1 className="font-manrope text-xl font-bold text-slate-950 sm:text-2xl lg:text-3xl">
          Laporan & Analisis
        </h1>

        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
          Pantau performa inventaris, pergerakan stok, dan efisiensi operasional
          apotek.
        </p>
      </div>

      <ReportsClient />
    </div>
  );
}