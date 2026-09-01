"use client";

import React from "react";
import { Filter } from "lucide-react";

interface EmployeeFilterBarProps {
  selectedRoleFilter: string;
  onRoleFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const EmployeeFilterBar: React.FC<EmployeeFilterBarProps> = ({
  selectedRoleFilter,
  onRoleFilterChange,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-3 w-full sm:w-auto">
        <div className="flex items-center space-x-2 pl-2 text-sm font-medium text-slate-700">
          <Filter className="h-4 w-4 text-slate-600" />
          <span>Filter:</span>
          <span className="text-slate-300 hidden sm:inline">|</span>
        </div>

        <select
          value={selectedRoleFilter}
          onChange={onRoleFilterChange}
          className="block w-full sm:w-auto sm:min-w-45 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-slate-400 focus:ring-slate-400"
        >
          <option value="">Semua Peran</option>
          <option value="ADMINISTRATOR">Administrator</option>
          <option value="APOTEKER_PENANGGUNG_JAWAB">Apoteker (APJ)</option>
          <option value="TENAGA_TEKNIS_KEFARMASIAN">
            Tenaga Teknis Kefarmasian
          </option>
          <option value="ADMIN_LOGISTIK">Admin Logistik</option>
          <option value="OWNER">Owner</option>
        </select>
      </div>
    </div>
  );
};
