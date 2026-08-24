import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/config";
import { POStatus } from "@/prisma/config";
import { createPurchaseOrderSchema } from "@/lib/validations/purchase-order";

async function generatePoNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const prefix = `PO-${year}${month}-`;

  const lastPo = await prisma.purchaseOrder.findFirst({
    where: {
      poNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      poNumber: "desc",
    },
  });

  let nextNumber = 1;

  if (lastPo) {
    const lastSequence = Number(lastPo.poNumber.slice(prefix.length));

    if (!Number.isNaN(lastSequence)) {
      nextNumber = lastSequence + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

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
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        ...(status &&
          Object.values(POStatus).includes(status as POStatus) && {
            status: status as POStatus,
          }),
        ...(search && {
          OR: [
            { poNumber: { contains: search, mode: "insensitive" } },
            { supplier: { name: { contains: search, mode: "insensitive" } } },
          ],
        }),
      },
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        items: {
          select: {
            id: true,
            quantity: true,
            receivedQty: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: purchaseOrders,
    });
  } catch (error) {
    console.error("GET Purchase Orders Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data purchase order." },
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

    const validatedFields = createPurchaseOrderSchema.safeParse(body);

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

    const { supplierId, notes, items } = validatedFields.data;

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier || !supplier.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier tidak ditemukan atau tidak aktif.",
        },
        { status: 400 },
      );
    }

    const itemIds = items.map((item) => item.itemId);
    const uniqueItemIds = [...new Set(itemIds)];

    const existingItems = await prisma.item.findMany({
      where: {
        id: { in: uniqueItemIds },
        isActive: true,
      },
      select: { id: true },
    });

    const existingItemIds = new Set(existingItems.map((item) => item.id));

    for (const item of items) {
      if (!existingItemIds.has(item.itemId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Barang tidak ditemukan atau tidak aktif.",
            errors: { items: ["Barang tidak ditemukan atau tidak aktif."] },
          },
          { status: 400 },
        );
      }
    }

    const totalAmount = items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0,
    );

    const poNumber = await generatePoNumber();

    const newPurchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId,
        createdById: session.user.id,
        status: POStatus.PENDING,
        totalAmount,
        notes: notes || null,
        items: {
          create: items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            receivedQty: 0,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        items: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Purchase Order berhasil dibuat.",
        data: newPurchaseOrder,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST Purchase Order Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat purchase order." },
      { status: 500 },
    );
  }
}
