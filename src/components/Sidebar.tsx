"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Archive,
  Receipt,
  Truck,
  ClipboardCheck,
  BrainCircuit,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
  LogOut,
  LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Inventory",
    icon: Archive,
    children: [
      {
        label: "Obat OTC",
        href: "/inventory/otc",
      },
      {
        label: "Resep",
        href: "/inventory/prescription",
      },
      {
        label: "Non Obat",
        href: "/inventory/non-medicine",
      },
      {
        label: "Stock Masuk",
        href: "/inventory/incoming",
      },
      {
        label: "Stock Keluar",
        href: "/inventory/outgoing",
      },
    ],
  },
  {
    label: "Purchase Order",
    href: "/purchase-order",
    icon: Receipt,
  },
  {
    label: "Supplier",
    href: "/supplier",
    icon: Truck,
  },
  {
    label: "Stock Audit",
    href: "/stock-audit",
    icon: ClipboardCheck,
  },
  {
    label: "AI Insights",
    href: "/ai-insights",
    icon: BrainCircuit,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "Manage Users",
    href: "/user-management",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(() => {
    return pathname.startsWith("/inventory") ? "Inventory" : null;
  });

  const isActive = (path?: string) => {
    return Boolean(path && pathname === path);
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu((prev) => {
      return prev === label ? null : label;
    });
  };

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login",
    });
  };

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col justify-between border-r border-slate-200 bg-white p-6">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mb-8 mt-2 flex shrink-0 items-center justify-start px-2">
          <Link href="/dashboard">
            <Image
              src="/images/logo.png"
              alt="ApotekIn"
              width={220}
              height={70}
              priority
              className="h-auto w-44 object-contain"
            />
          </Link>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = Boolean(item.children?.length);

            const isItemActive = isActive(item.href);

            const isChildActive =
              item.children?.some((child) => isActive(child.href)) ?? false;

            const isOpen = openSubmenu === item.label;

            if (hasChildren) {
              return (
                <div key={item.label} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(item.label)}
                    aria-expanded={isOpen}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 font-medium transition-colors ${
                      isChildActive
                        ? "bg-emerald-50 font-semibold text-emerald-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 pl-1">
                      <Icon className="h-5 w-5 shrink-0" />

                      <span>{item.label}</span>
                    </div>

                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="space-y-1 pl-10 pr-2">
                      {item.children?.map((child) => {
                        const childActive = isActive(child.href);

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                              childActive
                                ? "bg-emerald-100/70 font-semibold text-emerald-700"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href ?? "#"}
                className={`flex items-center gap-3.5 rounded-xl border-l-4 px-3.5 py-3 font-medium transition-colors ${
                  isItemActive
                    ? "border-emerald-600 bg-emerald-100/60 font-semibold text-emerald-700"
                    : "border-transparent text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-2 shrink-0 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-5 w-5 shrink-0" />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
