export type RoleType =
  | "ADMINISTRATOR"
  | "APOTEKER_PENANGGUNG_JAWAB"
  | "TENAGA_TEKNIS_KEFARMASIAN"
  | "ADMIN_LOGISTIK"
  | "OWNER";

export interface Personnel {
  id: string;
  fullName: string;
  email: string;
  noSIPA?: string;
  phone?: string;
  avatarUrl?: string;
  role: RoleType;
  lastLogin: string | null;
}

export interface StatsData {
  total: number;
  apoteker: number;
  ttk: number;
  adminLogistik: number;
}

export interface EmployeesPagination {
  totalPages?: number;
  totalItems?: number;
}

export interface EmployeesResponse {
  success: boolean;
  data: Personnel[];
  pagination: EmployeesPagination;
  stats: StatsData;
  message?: string;
  errors?: Record<string, unknown>;
}

export interface EmployeeFormData {
  fullName: string;
  email: string;
  noSIPA: string;
  phone: string;
  role: RoleType;
  password: string;
  confirmPassword: string;
}