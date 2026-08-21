import { Supplier as PrismaSupplier } from "@/prisma/config";

export type Supplier = PrismaSupplier;

export interface SupplierFormData {
  code: string;
  name: string;
  phone: string;
  contactPerson: string;
  email: string;
  address: string;
}

export interface MetricItem {
  title: string;
  value: string | number;
  iconColor: string;
}