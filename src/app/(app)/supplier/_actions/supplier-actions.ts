"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/prisma/config";
import { SupplierFormData } from "@/types/supplier";

export async function getSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: suppliers };
  } catch (error) {
    return { success: false, error: "Gagal mengambil data supplier" };
  }
}

export async function createSupplier(data: SupplierFormData) {
  try {
    const newSupplier = await prisma.supplier.create({
      data: {
        code: data.code,
        name: data.name,
        phone: data.phone,
        contactPerson: data.contactPerson || null,
        email: data.email || null,
        address: data.address || null,
      },
    });

    revalidatePath("/supplier");
    return { success: true, data: newSupplier };
  } catch (error) {
    return { success: false, error: "Gagal membuat supplier baru" };
  }
}

export async function updateSupplier(id: string, data: SupplierFormData) {
  try {
    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        phone: data.phone,
        contactPerson: data.contactPerson || null,
        email: data.email || null,
        address: data.address || null,
      },
    });

    revalidatePath("/supplier");
    return { success: true, data: updatedSupplier };
  } catch (error) {
    return { success: false, error: "Gagal mengupdate supplier" };
  }
}

export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/supplier");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus supplier" };
  }
}
