"use client";

import React from "react";
import Image from "next/image";
import {
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown-menu";
import { Personnel, RoleType } from "@/types/employee";

export const PAGE_SIZE = 10;

const ROLE_PERMISSIONS_MAP: Record<RoleType, string> = {
  ADMINISTRATOR: "Full Akses Sistem",
  APOTEKER_PENANGGUNG_JAWAB: "Inventaris Lengkap + Akses Klinis",
  TENAGA_TEKNIS_KEFARMASIAN: "Pelayanan & Penjualan",
  ADMIN_LOGISTIK: "Kelola Stok & Gudang",
  OWNER: "Akses Laporan & Eksekutif",
};

const ROLE_LABELS: Record<RoleType, string> = {
  ADMINISTRATOR: "Administrator",
  APOTEKER_PENANGGUNG_JAWAB: "Apoteker (APJ)",
  TENAGA_TEKNIS_KEFARMASIAN: "TTK",
  ADMIN_LOGISTIK: "Admin Logistik",
  OWNER: "Owner",
};

function getRoleBadgeClass(role: RoleType): string {
  switch (role) {
    case "APOTEKER_PENANGGUNG_JAWAB":
      return "bg-emerald-100 text-emerald-800";
    case "TENAGA_TEKNIS_KEFARMASIAN":
      return "bg-blue-100 text-blue-700";
    case "ADMINISTRATOR":
      return "bg-purple-100 text-purple-800";
    case "ADMIN_LOGISTIK":
      return "bg-amber-100 text-amber-900";
    case "OWNER":
    default:
      return "bg-slate-100 text-slate-800";
  }
}

function formatLastLogin(lastLogin: string | null): string {
  if (!lastLogin) {
    return "Belum pernah login";
  }
  const date = new Date(lastLogin);
  if (Number.isNaN(date.getTime())) {
    return "Belum pernah login";
  }
  return date.toLocaleString("id-ID");
}

interface EmployeeTableProps {
  personnelList: Personnel[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onEditUser: (person: Personnel) => void;
  onDeleteUser: (id: string) => void;
  onPageChange: (page: number) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  personnelList,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  onEditUser,
  onDeleteUser,
  onPageChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalItems);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 font-medium text-slate-700">
              <th className="w-16 px-4 py-3 text-center">No</th>
              <th className="px-6 py-3">Personil</th>
              <th className="px-6 py-3">Role & Permissions</th>
              <th className="px-6 py-3">Login Terakhir</th>
              <th className="w-20 px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-emerald-600" />
                  Memuat data karyawan...
                </td>
              </tr>
            ) : personnelList.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Tidak ada data karyawan ditemukan.
                </td>
              </tr>
            ) : (
              personnelList.map((person, index) => (
                <tr
                  key={person.id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-4 py-4 text-center font-medium text-slate-500">
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={person.avatarUrl || "/images/default-avatar.webp"}
                        alt={person.fullName}
                        width={40}
                        height={40}
                        className="rounded-full border border-slate-200 object-cover"
                      />

                      <div>
                        <p className="font-semibold leading-tight text-slate-900">
                          {person.fullName}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {person.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${getRoleBadgeClass(
                          person.role,
                        )}`}
                      >
                        {ROLE_LABELS[person.role]}
                      </span>

                      <p className="text-xs text-slate-600">
                        {ROLE_PERMISSIONS_MAP[person.role]}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-600">
                      {formatLastLogin(person.lastLogin)}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <Dropdown
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-500 hover:text-slate-800"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      }
                    >
                      <DropdownItem onClick={() => onEditUser(person)}>
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </DropdownItem>

                      <DropdownItem
                        onClick={() => onDeleteUser(person.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </DropdownItem>
                    </Dropdown>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-row items-center justify-between border-t border-slate-200 bg-slate-50/80 px-6 py-3 text-xs text-slate-500">
        <span>
          Menampilkan {startItem}-{endItem} dari {totalItems} personel
        </span>

        <div className="flex items-center space-x-1 font-medium">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1 || isLoading}
            className="rounded border border-slate-200 p-1 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className={`flex h-7 w-7 items-center justify-center rounded font-semibold disabled:cursor-not-allowed ${
                  currentPage === page
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() =>
              onPageChange(Math.min(currentPage + 1, totalPages))
            }
            disabled={
              currentPage === totalPages || totalPages === 0 || isLoading
            }
            className="rounded border border-slate-200 p-1 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};