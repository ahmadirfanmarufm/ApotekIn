"use client";

import React from "react";
import { Users, FileBadge, Contact, UserCheck } from "lucide-react";
import { StatsData } from "@/types/employee";

interface EmployeeStatsProps {
  stats: StatsData;
}

export const EmployeeStats: React.FC<EmployeeStatsProps> = ({ stats }) => {
  const statsCards = [
    {
      label: "Total Personnel",
      value: stats.total,
      icon: Users,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
    },
    {
      label: "Total Apoteker",
      value: stats.apoteker,
      icon: FileBadge,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Total Tenaga Teknis Kefarmasian",
      value: stats.ttk,
      icon: Contact,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-800",
    },
    {
      label: "Total Admin Logistik",
      value: stats.adminLogistik,
      icon: UserCheck,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex flex-col justify-between space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.iconBg}`}
            >
              <Icon className={`h-5 w-5 ${item.iconColor}`} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold leading-snug text-slate-600">
                {item.label}
              </p>
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};