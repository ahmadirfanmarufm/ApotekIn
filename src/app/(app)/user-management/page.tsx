"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileBadge,
  Contact,
  UserCheck,
  Filter,
  Download,
  Printer,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  Edit,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import Image from "next/image";

type RoleType =
  | "ADMINISTRATOR"
  | "APOTEKER_PENANGGUNG_JAWAB"
  | "TENAGA_TEKNIS_KEFARMASIAN"
  | "ADMIN_LOGISTIK"
  | "OWNER";

interface Personnel {
  id: string;
  fullName: string;
  email: string;
  noSIPA?: string;
  phone?: string;
  avatarUrl?: string;
  role: RoleType;
  lastLogin: string | null;
}

interface StatsData {
  total: number;
  apoteker: number;
  ttk: number;
  adminLogistik: number;
}

interface EmployeesPagination {
  totalPages?: number;
  totalItems?: number;
}

interface EmployeesResponse {
  success: boolean;
  data: Personnel[];
  pagination: EmployeesPagination;
  stats: StatsData;
  message?: string;
  errors?: Record<string, unknown>;
}

interface EmployeeFormData {
  fullName: string;
  email: string;
  noSIPA: string;
  phone: string;
  role: RoleType;
  password: string;
  confirmPassword: string;
}

const PAGE_SIZE = 10;

const DEFAULT_FORM_DATA: EmployeeFormData = {
  fullName: "",
  email: "",
  noSIPA: "",
  phone: "",
  role: "TENAGA_TEKNIS_KEFARMASIAN",
  password: "",
  confirmPassword: "",
};

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

function getValidationErrors(
  errors: Record<string, unknown>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, String(value[0] ?? "")];
      }

      return [key, String(value ?? "")];
    }),
  );
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

export default function UserManagementPage() {
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);

  const [stats, setStats] = useState<StatsData>({
    total: 0,
    apoteker: 0,
    ttk: 0,
    adminLogistik: 0,
  });

  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Personnel | null>(null);

  const [formData, setFormData] =
    useState<EmployeeFormData>(DEFAULT_FORM_DATA);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /**
   * Digunakan untuk memicu refetch setelah:
   * - create
   * - update
   * - delete
   */
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Fetch employees.
   *
   * Tidak menggunakan callback terpisah yang dipanggil
   * secara synchronously dari useEffect.
   */
  useEffect(() => {
    const controller = new AbortController();

    const loadEmployees = async () => {
      setIsLoading(true);

      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: PAGE_SIZE.toString(),
        });

        if (selectedRoleFilter) {
          queryParams.set("role", selectedRoleFilter);
        }

        const response = await fetch(
          `/api/user?${queryParams.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const json = (await response.json()) as EmployeesResponse;

        if (!response.ok || !json.success) {
          throw new Error(
            json.message ?? "Gagal mengambil data karyawan.",
          );
        }

        setPersonnelList(json.data ?? []);

        setTotalPages(
          Math.max(json.pagination?.totalPages ?? 1, 1),
        );

        setTotalItems(json.pagination?.totalItems ?? 0);

        setStats({
          total: json.stats?.total ?? 0,
          apoteker: json.stats?.apoteker ?? 0,
          ttk: json.stats?.ttk ?? 0,
          adminLogistik: json.stats?.adminLogistik ?? 0,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to fetch employees:", error);

        setPersonnelList([]);
        setTotalPages(1);
        setTotalItems(0);
        setStats({
          total: 0,
          apoteker: 0,
          ttk: 0,
          adminLogistik: 0,
        });
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadEmployees();

    return () => {
      controller.abort();
    };
  }, [currentPage, selectedRoleFilter, refreshKey]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData(DEFAULT_FORM_DATA);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (person: Personnel) => {
    setEditingUser(person);

    setFormData({
      fullName: person.fullName,
      email: person.email,
      noSIPA: person.noSIPA ?? "",
      phone: person.phone ?? "",
      role: person.role,
      password: "",
      confirmPassword: "",
    });

    setFormErrors({});
    setActiveActionId(null);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus karyawan ini?",
    );

    if (!confirmed) {
      return;
    }

    setActiveActionId(null);

    try {
      const response = await fetch(`/api/user/${id}`, {
        method: "DELETE",
      });

      const json = (await response.json()) as EmployeesResponse;

      if (!response.ok || !json.success) {
        window.alert(
          json.message ?? "Gagal menghapus karyawan.",
        );
        return;
      }

      /**
       * Trigger refetch tanpa memanggil function fetch
       * secara langsung dari event handler.
       */
      setRefreshKey((previous) => previous + 1);
    } catch (error) {
      console.error("Failed to delete employee:", error);

      window.alert(
        "Terjadi kesalahan saat menghapus karyawan.",
      );
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitLoading(true);
    setFormErrors({});

    try {
      const url = editingUser
        ? `/api/user/${editingUser.id}`
        : "/api/user";

      const method = editingUser ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const json = (await response.json()) as EmployeesResponse;

      if (!response.ok || !json.success) {
        if (json.errors) {
          setFormErrors(getValidationErrors(json.errors));
        } else {
          window.alert(
            json.message ?? "Terjadi kesalahan.",
          );
        }

        return;
      }

      setIsModalOpen(false);
      setEditingUser(null);
      setFormData(DEFAULT_FORM_DATA);
      setFormErrors({});

      setRefreshKey((previous) => previous + 1);
    } catch (error) {
      console.error("Failed to save employee:", error);

      window.alert(
        "Terjadi kesalahan saat menyimpan data karyawan.",
      );
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleRoleFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedRoleFilter(event.target.value);

    /**
     * Saat filter berubah, kembali ke page pertama.
     */
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((previous) => Math.max(previous - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((previous) =>
      Math.min(previous + 1, totalPages),
    );
  };

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

  const startItem =
    totalItems === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(
    currentPage * PAGE_SIZE,
    totalItems,
  );

  return (
    <div className="relative space-y-6 font-inter text-slate-800">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="font-manrope text-3xl font-bold text-slate-950">
            Manajemen Karyawan
          </h1>

          <p className="mt-1 text-slate-500">
            Kelola akses dan peran karyawan anda.
          </p>
        </div>

        <div>
          <Button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Karyawan
          </Button>
        </div>
      </div>

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

                <p className="text-2xl font-bold text-slate-900">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 pl-2 text-sm font-medium text-slate-700">
            <Filter className="h-4 w-4 text-slate-600" />
            <span>Filter:</span>
            <span className="text-slate-300">|</span>
          </div>

          <select
            value={selectedRoleFilter}
            onChange={handleRoleFilterChange}
            className="block min-w-45 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-slate-400 focus:ring-slate-400"
          >
            <option value="">Semua Peran</option>
            <option value="ADMINISTRATOR">
              Administrator
            </option>
            <option value="APOTEKER_PENANGGUNG_JAWAB">
              Apoteker (APJ)
            </option>
            <option value="TENAGA_TEKNIS_KEFARMASIAN">
              Tenaga Teknis Kefarmasian
            </option>
            <option value="ADMIN_LOGISTIK">
              Admin Logistik
            </option>
            <option value="OWNER">Owner</option>
          </select>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-600 hover:text-slate-900"
          >
            <Download className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-slate-600 hover:text-slate-900"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 font-medium text-slate-700">
                <th className="w-16 px-4 py-3 text-center">
                  No
                </th>

                <th className="px-6 py-3">
                  Personil
                </th>

                <th className="px-6 py-3">
                  Role & Permissions
                </th>

                <th className="px-6 py-3">
                  Login Terakhir
                </th>

                <th className="w-20 px-4 py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-slate-500"
                  >
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-emerald-600" />
                    Memuat data karyawan...
                  </td>
                </tr>
              ) : personnelList.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-slate-500"
                  >
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
                      {(currentPage - 1) * PAGE_SIZE +
                        index +
                        1}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={
                            person.avatarUrl ||
                            "/images/default-avatar.webp"
                          }
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
                          {
                            ROLE_PERMISSIONS_MAP[
                              person.role
                            ]
                          }
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600">
                        {formatLastLogin(person.lastLogin)}
                      </p>
                    </td>

                    <td className="relative px-4 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setActiveActionId((previous) =>
                            previous === person.id
                              ? null
                              : person.id,
                          )
                        }
                        className="text-slate-500 hover:text-slate-800"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {activeActionId === person.id && (
                        <div className="absolute right-6 top-12 z-20 w-36 rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenEditModal(person)
                            }
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit User
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDeleteUser(person.id)
                            }
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete User
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-row items-center justify-between border-t border-slate-200 bg-slate-50/80 px-6 py-3 text-xs text-slate-500">
          <span>
            Menampilkan {startItem}-{endItem} dari{" "}
            {totalItems} personel
          </span>

          <div className="flex items-center space-x-1 font-medium">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading}
              className="rounded border border-slate-200 p-1 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1,
            ).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                disabled={isLoading}
                className={`flex h-7 w-7 items-center justify-center rounded font-semibold disabled:cursor-not-allowed ${
                  currentPage === page
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={handleNextPage}
              disabled={
                currentPage === totalPages ||
                totalPages === 0 ||
                isLoading
              }
              className="rounded border border-slate-200 p-1 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg animate-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingUser
                  ? "Edit Karyawan"
                  : "Registrasi Karyawan"}
              </h2>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(event) => void handleSubmit(event)}
              className="space-y-4 p-6"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Nama Lengkap{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                  autoComplete="name"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {formErrors.fullName && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Email{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contoh@apotekin.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Nomor SIPA{" "}
                    <span className="font-normal text-slate-400">
                      (Opsional)
                    </span>
                  </label>

                  <input
                    type="text"
                    name="noSIPA"
                    value={formData.noSIPA}
                    onChange={handleInputChange}
                    placeholder="Nomor SIPA"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Nomor HP{" "}
                    <span className="font-normal text-slate-400">
                      (Opsional)
                    </span>
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="08xxxxxxxxxx"
                    autoComplete="tel"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Role / Permission{" "}
                  <span className="text-red-500">*</span>
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ADMINISTRATOR">
                    Administrator
                  </option>

                  <option value="APOTEKER_PENANGGUNG_JAWAB">
                    APJ (Apoteker Penanggung Jawab)
                  </option>

                  <option value="TENAGA_TEKNIS_KEFARMASIAN">
                    TTK (Tenaga Teknis Kefarmasian)
                  </option>

                  <option value="ADMIN_LOGISTIK">
                    Admin Logistik
                  </option>

                  <option value="OWNER">
                    Owner
                  </option>
                </select>

                {formErrors.role && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.role}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Password{" "}
                    {!editingUser && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={
                      editingUser
                        ? "Kosongkan jika tak diubah"
                        : "Minimal 6 karakter"
                    }
                    autoComplete={
                      editingUser ? "new-password" : "new-password"
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  {formErrors.password && (
                    <p className="mt-1 text-xs text-red-500">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Konfirmasi Password{" "}
                    {!editingUser && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Ulangi password"
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitLoading}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="min-w-30 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {isSubmitLoading ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : editingUser ? (
                    "Simpan Perubahan"
                  ) : (
                    "Buat Karyawan"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}