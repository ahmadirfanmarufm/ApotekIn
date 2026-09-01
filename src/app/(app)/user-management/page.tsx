"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeStats } from "@/components/user-management/EmployeeStats";
import { EmployeeFilterBar } from "@/components/user-management/EmployeeFilter";
import {
  EmployeeTable,
  PAGE_SIZE,
} from "@/components/user-management/EmployeeTable";
import { EmployeeModal } from "@/components/user-management/EmployeeModal";
import {
  Personnel,
  StatsData,
  EmployeesResponse,
  EmployeeFormData,
} from "@/types/employee";
import Swal from "sweetalert2";

const DEFAULT_FORM_DATA: EmployeeFormData = {
  fullName: "",
  email: "",
  noSIPA: "",
  phone: "",
  role: "TENAGA_TEKNIS_KEFARMASIAN",
  password: "",
  confirmPassword: "",
};

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
  const [editingUser, setEditingUser] = useState<Personnel | null>(null);

  const [formData, setFormData] = useState<EmployeeFormData>(DEFAULT_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);

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

        const response = await fetch(`/api/user?${queryParams.toString()}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const json = (await response.json()) as EmployeesResponse;

        if (!response.ok || !json.success) {
          throw new Error(json.message ?? "Gagal mengambil data karyawan.");
        }

        setPersonnelList(json.data ?? []);
        setTotalPages(Math.max(json.pagination?.totalPages ?? 1, 1));
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
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Apakah Anda yakin ingin menghapus karyawan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/user/${id}`, {
        method: "DELETE",
      });

      const json = (await response.json()) as EmployeesResponse;

      if (!response.ok || !json.success) {
        await Swal.fire({
          title: "Gagal",
          text: json.message ?? "Gagal menghapus karyawan.",
          icon: "error",
          confirmButtonColor: "#059669",
        });
        return;
      }

      await Swal.fire({
        title: "Berhasil",
        text: "Data karyawan berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setRefreshKey((previous) => previous + 1);
    } catch (error) {
      console.error("Failed to delete employee:", error);
      await Swal.fire({
        title: "Terjadi Kesalahan",
        text: "Terjadi kesalahan saat menghapus karyawan.",
        icon: "error",
        confirmButtonColor: "#059669",
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitLoading(true);
    setFormErrors({});

    try {
      const url = editingUser ? `/api/user/${editingUser.id}` : "/api/user";
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
          window.alert(json.message ?? "Terjadi kesalahan.");
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
      window.alert("Terjadi kesalahan saat menyimpan data karyawan.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleRoleFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedRoleFilter(event.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="relative space-y-6 font-inter text-slate-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-manrope text-2xl font-bold text-slate-950">
            Manajemen Karyawan
          </h1>

          <p className="mt-1 text-slate-500">
            Kelola akses dan peran karyawan anda.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <Button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Tambah Karyawan
          </Button>
        </div>
      </div>

      <EmployeeStats stats={stats} />

      <EmployeeFilterBar
        selectedRoleFilter={selectedRoleFilter}
        onRoleFilterChange={handleRoleFilterChange}
      />

      <EmployeeTable
        personnelList={personnelList}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onEditUser={handleOpenEditModal}
        onDeleteUser={(id) => void handleDeleteUser(id)}
        onPageChange={setCurrentPage}
      />

      <EmployeeModal
        isOpen={isModalOpen}
        editingUser={editingUser}
        formData={formData}
        formErrors={formErrors}
        isSubmitLoading={isSubmitLoading}
        onClose={() => setIsModalOpen(false)}
        onInputChange={handleInputChange}
        onSubmit={(event) => void handleSubmit(event)}
      />
    </div>
  );
}
