"use client";

import { useEffect, useState } from "react";

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
  X,
  type LucideIcon,
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
  permission?: string;
}

interface SidebarProps {
  permissions: string[];
  isOpen: boolean;
  onClose: () => void;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.view",
  },
  {
    label: "Inventory",
    icon: Archive,
    permission: "inventory.view",
    children: [
      {
        label: "Obat OTC",
        href: "/inventory/otc",
      },
      {
        label: "Resep",
        href: "/inventory/compound",
      },
      {
        label: "Non Obat",
        href: "/inventory/nonmedicine",
      },
      {
        label: "Stok Masuk",
        href: "/inventory/incoming",
      },
      {
        label: "Stok Keluar",
        href: "/inventory/outgoing",
      },
    ],
  },
  {
    label: "Purchase Order",
    href: "/purchase-order",
    icon: Receipt,
    permission: "purchase_order.view",
  },
  {
    label: "Supplier",
    href: "/supplier",
    icon: Truck,
    permission: "supplier.view",
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
    permission: "ai_insight.view",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    permission: "reports.view",
  },
  {
    label: "Manage Users",
    href: "/user-management",
    icon: Users,
    permission: "user_management.view",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ permissions, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(() => {
    return pathname.startsWith("/inventory") ? "Inventory" : null;
  });

  const hasPermission = (permission?: string) => {
    if (!permission) {
      return true;
    }

    return (permissions.includes("*") || permissions.includes(permission));
  };

  useEffect(() => {
    onClose();

  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = (path?: string) => {
    return Boolean(path && pathname === path);
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu((prev) =>
      prev === label ? null : label,
    );
  };

  const handleLogout = async () => {
    onClose();

    await signOut({
      callbackUrl: "/login",
    });
  };

  const visibleNavItems = navItems.filter((item) =>
    hasPermission(item.permission),
  );

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-72 sm:w-64 flex-col justify-between border-r border-slate-200 bg-white p-4 sm:p-6 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Logo */}
          <div className="mb-6 mt-1 flex shrink-0 items-center justify-between px-1 sm:mb-8 sm:mt-2 sm:px-2">
            <Link
              href="/dashboard"
              className="min-w-0"
              onClick={onClose}
            >
              <Image
                src="/images/logo.png"
                alt="ApotekIn"
                width={220}
                height={70}
                priority
                className="h-auto w-36 object-contain sm:w-44"
              />
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup menu"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;

              const hasChildren = Boolean(
                item.children?.length,
              );

              const isItemActive = isActive(item.href);

              const isChildActive =
                item.children?.some((child) =>
                  isActive(child.href),
                ) ?? false;

              const isOpenSubmenu =
                openSubmenu === item.label;

              if (hasChildren) {
                return (
                  <div
                    key={item.label}
                    className="space-y-1"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleSubmenu(item.label)
                      }
                      aria-expanded={isOpenSubmenu}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors sm:px-3.5 sm:py-3 sm:text-base ${
                        isChildActive
                          ? "bg-emerald-50 font-semibold text-emerald-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 pl-1 sm:gap-3.5">
                        <Icon className="h-5 w-5 shrink-0" />

                        <span>{item.label}</span>
                      </div>

                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isOpenSubmenu
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {isOpenSubmenu && (
                      <div className="space-y-1 pl-9 pr-2 sm:pl-10">
                        {item.children?.map((child) => {
                          const childActive =
                            isActive(child.href);

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={onClose}
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
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl border-l-4 px-3 py-2.5 text-sm font-medium transition-colors sm:gap-3.5 sm:px-3.5 sm:py-3 sm:text-base ${
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

        {/* Logout */}
        <div className="mt-2 shrink-0 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 sm:gap-3.5 sm:px-3.5 sm:py-3 sm:text-base"
          >
            <LogOut className="h-5 w-5 shrink-0" />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}