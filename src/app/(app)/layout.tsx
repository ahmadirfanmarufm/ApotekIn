import React from "react";

import { redirect } from "next/navigation";

import { AppShell } from "@/components/AppShell";

import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permission";

export default async function AppLayout({ children }: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const permissions = await getUserPermissions(session.user.id, session.user.role );

  return (
    <AppShell permissions={permissions}>
      {children}
    </AppShell>
  );
}