import {
  prisma,
  Role,
  ItemCategory,
  POStatus,
  AuditStatus,
  NotificationType,
  InsightType,
} from "@/prisma/config";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Starting Database Seeding for ApotekIn...\n");

  const usersData = [
    {
      email: "admin@apotekin.com",
      fullName: "Damar Syahada Kusuma",
      role: Role.ADMINISTRATOR,
      phone: "081234567890",
    },
    {
      email: "apj@apotekin.com",
      fullName: "Apoteker Penanggung Jawab, S.Farm",
      role: Role.APOTEKER_PENANGGUNG_JAWAB,
      phone: "081234567891",
    },
    {
      email: "ttk@apotekin.com",
      fullName: "Raihan Yassar (TTK)",
      role: Role.TENAGA_TEKNIS_KEFARMASIAN,
      phone: "081234567892",
    },
    {
      email: "logistik@apotekin.com",
      fullName: "Ahmad Irfan (Admin Logistik)",
      role: Role.ADMIN_LOGISTIK,
      phone: "081234567893",
    },
    {
      email: "owner@apotekin.com",
      fullName: "Bapak Owner Apotek",
      role: Role.OWNER,
      phone: "081234567894",
    },
  ];

  const passwordHash = await bcrypt.hash("password123", 10);

  const createdUsers = [];

  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: {
        email: userData.email,
      },
      update: {},
      create: {
        email: userData.email,
        passwordHash,
        fullName: userData.fullName,
        role: userData.role,
        phone: userData.phone,
      },
    });

    createdUsers.push(user);
  }

  console.log(`Created ${createdUsers.length} users with all 5 roles.`);

  const supplierKimia = await prisma.supplier.upsert({
    where: {
      code: "PBF-KFA-01",
    },
    update: {},
    create: {
      code: "PBF-KFA-01",
      name: "PT Kimia Farma Trading & Distribution",
      contactPerson: "Budi Santoso",
      phone: "021-3841234",
      email: "order@kftd.co.id",
      address: "Jl. Banten No. 12, Bandung",
    },
  });

  const supplierAnugrah = await prisma.supplier.upsert({
    where: {
      code: "PBF-API-02",
    },
    update: {},
    create: {
      code: "PBF-API-02",
      name: "PT Anugrah Pharmindo Lestari",
      contactPerson: "Siti Rahma",
      phone: "021-5201234",
      email: "sales@apl.co.id",
      address: "Jl. Soekarno Hatta No. 450, Bandung",
    },
  });

  console.log("Suppliers Created");

  const itemParacetamol = await prisma.item.upsert({
    where: {
      code: "OBT-OTC-001",
    },
    update: {},
    create: {
      code: "OBT-OTC-001",
      name: "Paracetamol 500mg Tablet",
      category: ItemCategory.OBAT_OTC,
      unit: "Strip",
      minStock: 20,
      maxStock: 200,
      description: "Analgesik dan antipiretik penurun demam.",
    },
  });

  const itemAmoxicillin = await prisma.item.upsert({
    where: {
      code: "OBT-OTC-002",
    },
    update: {},
    create: {
      code: "OBT-OTC-002",
      name: "Amoxicillin Dry Syrup 125mg/5ml",
      category: ItemCategory.OBAT_OTC,
      unit: "Botol",
      minStock: 15,
      maxStock: 100,
      description: "Antibiotik Golongan Penisilin.",
    },
  });

  const itemParacetamolPowder = await prisma.item.upsert({
    where: {
      code: "BHN-RAC-001",
    },
    update: {},
    create: {
      code: "BHN-RAC-001",
      name: "Paracetamol Serbuk Murni (Bahan Peracikan)",
      category: ItemCategory.BAHAN_RACIKAN,
      unit: "Gram",
      minStock: 100,
      maxStock: 1000,
      description: "Bahan baku serbuk puyer racikan anak.",
    },
  });

  const itemAlcohol = await prisma.item.upsert({
    where: {
      code: "NON-OBT-001",
    },
    update: {},
    create: {
      code: "NON-OBT-001",
      name: "Alkohol 70% Antiseptik 100ml",
      category: ItemCategory.NON_OBAT,
      unit: "Botol",
      minStock: 10,
      maxStock: 50,
      description: "Cairan antiseptik pembersih luka/peralatan.",
    },
  });

  console.log("Inventory Items Created across 3 categories");

  const today = new Date();

  const batchPcm1 = await prisma.batch.create({
    data: {
      batchNumber: "BCH-PCM-202501",
      itemId: itemParacetamol.id,
      quantity: 15,
      initialQuantity: 100,
      expiryDate: new Date(today.getFullYear(), today.getMonth() + 1, 15),
      buyPrice: 3500,
      sellPrice: 6000,
    },
  });

  await prisma.batch.create({
    data: {
      batchNumber: "BCH-PCM-202602",
      itemId: itemParacetamol.id,
      quantity: 100,
      initialQuantity: 100,
      expiryDate: new Date(today.getFullYear() + 2, today.getMonth(), 10),
      buyPrice: 3800,
      sellPrice: 6500,
    },
  });

  await prisma.batch.create({
    data: {
      batchNumber: "BCH-AMX-202505",
      itemId: itemAmoxicillin.id,
      quantity: 8,
      initialQuantity: 50,
      expiryDate: new Date(today.getFullYear() + 1, 5, 20),
      buyPrice: 8000,
      sellPrice: 13000,
    },
  });

  console.log("Multi-Batches Created for FEFO testing");

  const ttkUser = createdUsers.find(
    (user) => user.role === Role.TENAGA_TEKNIS_KEFARMASIAN,
  )!;

  const logistikUser = createdUsers.find(
    (user) => user.role === Role.ADMIN_LOGISTIK,
  )!;

  const apjUser = createdUsers.find(
    (user) => user.role === Role.APOTEKER_PENANGGUNG_JAWAB,
  )!;

  await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-202608-001",
      supplierId: supplierKimia.id,
      createdById: logistikUser.id,
      status: POStatus.RECEIVED,
      totalAmount: 380000,
      receivedAt: new Date(),
      notes: "Penerimaan barang rutin awal bulan.",
      items: {
        create: [
          {
            itemId: itemParacetamol.id,
            batchNumber: "BCH-PCM-202602",
            quantity: 100,
            expiryDate: new Date(today.getFullYear() + 2, today.getMonth(), 10),
            unitPrice: 3800,
          },
        ],
      },
    },
  });

  await prisma.stockOut.create({
    data: {
      referenceNo: "TRX-20260813-001",
      createdById: ttkUser.id,
      totalAmount: 30000,
      notes: "Penjualan resep obat bebas.",
      items: {
        create: [
          {
            batchId: batchPcm1.id,
            quantity: 5,
            unitPrice: 6000,
          },
        ],
      },
    },
  });

  console.log("Stock In & Stock Out Transactions Created");

  await prisma.stockAudit.create({
    data: {
      auditNumber: "AUDIT-2026-08",
      conductedById: apjUser.id,
      status: AuditStatus.COMPLETED,
      notes: "Audit rutin stok obat sirup dan racikan.",
      completedAt: new Date(),
      details: {
        create: [
          {
            itemId: itemAmoxicillin.id,
            systemStock: 10,
            physicalStock: 8,
            difference: -2,
            reason: "1 botol bocor/rusak, 1 botol selisih catat.",
          },
        ],
      },
    },
  });

  console.log("Stock Audit Sample Created");

  await prisma.aiInsight.create({
    data: {
      type: InsightType.EXECUTIVE_SUMMARY,
      title: "Ringkasan Kesehatan Inventaris Minggu Ini",
      summary:
        "Kondisi inventaris dalam status Sehat (Health Score 88%). Terdapat 1 obat dengan stok kritis (Amoxicillin Dry Syrup) dan 1 batch Paracetamol mendekati expired dalam 30 hari.",
      data: {
        healthScore: 88,
        criticalCount: 1,
        nearExpiryCount: 1,
        recommendedAction:
          "Lakukan Purchase Order ulang untuk Amoxicillin Dry Syrup ke PT Kimia Farma.",
      },
    },
  });

  await prisma.notification.create({
    data: {
      userId: logistikUser.id,
      title: "Alert Stok Kritis!",
      message:
        "Stok Amoxicillin Dry Syrup sisa 8 botol (Batas Minimum: 15 botol). Segera buat PO.",
      type: NotificationType.CRITICAL_STOCK,
      actionLink: "/inventory/manage-otc",
    },
  });

  console.log("AI Insights & Notifications Created\n");
  console.log("Seeding Completed Successfully!");
}

main()
  .catch((error) => {
    console.error("Seeding Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
