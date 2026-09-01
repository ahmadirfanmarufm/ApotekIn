import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { POStatus } from "@/prisma/config";
import { SupplierSchema } from "@/lib/validations/supplier";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();

    const suppliers = await prisma.supplier.findMany({
      where: {
        isActive: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
    });

    const supplierIds = suppliers.map((supplier) => supplier.id);

    type CountRow = {
      supplierId: string;
      _count: { _all: number };
    };

    let onDeliveryBySupplier = new Map<string, number>();
    let deliveredBySupplier = new Map<string, number>();
    let totalBySupplier = new Map<string, number>();

    if (supplierIds.length > 0) {
      const [onDeliveryRows, deliveredRows, totalRows] = await Promise.all([
        prisma.purchaseOrder.groupBy({
          by: ["supplierId"],
          where: {
            supplierId: { in: supplierIds },
            status: { in: [POStatus.PENDING, POStatus.PARTIAL] },
          },
          _count: { _all: true },
        }),
        prisma.purchaseOrder.groupBy({
          by: ["supplierId"],
          where: {
            supplierId: { in: supplierIds },
            status: POStatus.COMPLETED,
          },
          _count: { _all: true },
        }),
        prisma.purchaseOrder.groupBy({
          by: ["supplierId"],
          where: { supplierId: { in: supplierIds } },
          _count: { _all: true },
        }),
      ]);

      onDeliveryBySupplier = new Map(
        (onDeliveryRows as CountRow[]).map((row) => [
          row.supplierId,
          row._count._all,
        ]),
      );
      deliveredBySupplier = new Map(
        (deliveredRows as CountRow[]).map((row) => [
          row.supplierId,
          row._count._all,
        ]),
      );
      totalBySupplier = new Map(
        (totalRows as CountRow[]).map((row) => [
          row.supplierId,
          row._count._all,
        ]),
      );
    }

    const suppliersWithMetrics = suppliers.map((supplier) => ({
      ...supplier,
      onDelivery: onDeliveryBySupplier.get(supplier.id) ?? 0,
      Delivered: deliveredBySupplier.get(supplier.id) ?? 0,
      TotalDelivery: totalBySupplier.get(supplier.id) ?? 0,
    }));

    return NextResponse.json({
      success: true,
      data: suppliersWithMetrics,
    });
  } catch (error) {
    console.error("GET Suppliers Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data supplier." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const validatedFields = SupplierSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal.",
          errors: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { code, name, phone, contactPerson, email, address } =
      validatedFields.data;

    const existingSupplier = await prisma.supplier.findUnique({
      where: { code },
    });

    if (existingSupplier) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode supplier sudah digunakan.",
          errors: { code: ["Kode supplier sudah digunakan."] },
        },
        { status: 400 },
      );
    }

    const newSupplier = await prisma.supplier.create({
      data: {
        code,
        name,
        phone,
        contactPerson: contactPerson || null,
        email: email || null,
        address: address || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Supplier berhasil ditambahkan.",
        data: newSupplier,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST Supplier Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat supplier baru." },
      { status: 500 },
    );
  }
}
