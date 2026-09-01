import React from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permission";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const permissions = await getUserPermissions(session.user.id,session.user.role);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar permissions={permissions} />

      <div className="flex-1 ml-64 flex flex-col">
        <Navbar />

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}