import {
  prisma,
  Role,
  ItemCategory,
  POStatus,
  NotificationType,
  InsightType,
} from "@/prisma/config";
import bcrypt from "bcryptjs";

const today = new Date();

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

const PASSWORD = "password123";

type ItemSeed = {
  code: string;
  name: string;
  category: ItemCategory;
  unit: string;
  minStock: number;
  maxStock: number;
  description: string;
  buyPrice: number;
  sellPrice: number;
  batches: { quantity: number; expiresInMonths: number }[];
};

async function main() {
  console.log("Starting Database Seeding for ApotekIn (Healthy State)...\n");

  console.log("Cleaning up old data...");
  await prisma.notification.deleteMany();
  await prisma.aiInsight.deleteMany();
  await prisma.stockAuditDetail.deleteMany();
  await prisma.stockAudit.deleteMany();
  await prisma.stockOutItem.deleteMany();
  await prisma.stockOut.deleteMany();
  await prisma.stockReceiptItem.deleteMany();
  await prisma.stockReceipt.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.stockInTransactionItem.deleteMany();
  await prisma.stockInTransaction.deleteMany();
  await prisma.stockOutTransactionItem.deleteMany();
  await prisma.stockOutTransaction.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.item.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const usersData = [
    {
      email: "admin@apotekin.com",
      fullName: "Damar Syahada Kusuma",
      role: Role.ADMINISTRATOR,
    },
    {
      email: "apj@apotekin.com",
      fullName: "Apoteker Penanggung Jawab, S.Farm",
      role: Role.APOTEKER_PENANGGUNG_JAWAB,
    },
    {
      email: "ttk@apotekin.com",
      fullName: "Raihan Yassar (TTK)",
      role: Role.TENAGA_TEKNIS_KEFARMASIAN,
    },
    {
      email: "logistik@apotekin.com",
      fullName: "Ahmad Irfan (Admin Logistik)",
      role: Role.ADMIN_LOGISTIK,
    },
    {
      email: "owner@apotekin.com",
      fullName: "Bapak Owner Apotek",
      role: Role.OWNER,
    },
    {
      email: "apoteker2@apotekin.com",
      fullName: "Siti Nurhaliza, S.Farm",
      role: Role.APOTEKER_PENANGGUNG_JAWAB,
    },
    {
      email: "apoteker3@apotekin.com",
      fullName: "Rina Marlina, S.Farm",
      role: Role.APOTEKER_PENANGGUNG_JAWAB,
    },
    {
      email: "ttk2@apotekin.com",
      fullName: "Budi Prasetyo (TTK)",
      role: Role.TENAGA_TEKNIS_KEFARMASIAN,
    },
    {
      email: "ttk3@apotekin.com",
      fullName: "Dewi Lestari (TTK)",
      role: Role.TENAGA_TEKNIS_KEFARMASIAN,
    },
    {
      email: "ttk4@apotekin.com",
      fullName: "Fajar Nugroho (TTK)",
      role: Role.TENAGA_TEKNIS_KEFARMASIAN,
    },
    {
      email: "ttk5@apotekin.com",
      fullName: "Intan Permata (TTK)",
      role: Role.TENAGA_TEKNIS_KEFARMASIAN,
    },
    {
      email: "logistik2@apotekin.com",
      fullName: "Joko Susilo (Logistik)",
      role: Role.ADMIN_LOGISTIK,
    },
    {
      email: "logistik3@apotekin.com",
      fullName: "Kartika Sari (Logistik)",
      role: Role.ADMIN_LOGISTIK,
    },
    {
      email: "logistik4@apotekin.com",
      fullName: "Hendra Gunawan (Logistik)",
      role: Role.ADMIN_LOGISTIK,
    },
    {
      email: "logistik5@apotekin.com",
      fullName: "Maya Anggraini (Logistik)",
      role: Role.ADMIN_LOGISTIK,
    },
    {
      email: "admin2@apotekin.com",
      fullName: "Rizky Ramadhan (IT Admin)",
      role: Role.ADMINISTRATOR,
    },
    {
      email: "owner2@apotekin.com",
      fullName: "Ibu Owner Apotek",
      role: Role.OWNER,
    },
    {
      email: "owner3@apotekin.com",
      fullName: "Andi Wijaya (Owner Cabang)",
      role: Role.OWNER,
    },
  ];

  const createdUsers: { id: string; role: Role }[] = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        fullName: u.fullName,
        role: u.role,
      },
      select: { id: true, role: true },
    });
    createdUsers.push(user);
  }
  console.log(`Created ${createdUsers.length} users.\n`);

  const pickByRole = (role: Role) =>
    createdUsers.find((usr) => usr.role === role)!;
  const logistikUser = pickByRole(Role.ADMIN_LOGISTIK);
  const adminUser = pickByRole(Role.ADMINISTRATOR);

  const suppliers = [];
  const suppliersData = [
    {
      code: "PBF-KFA-01",
      name: "PT Kimia Farma Trading & Distribution",
      contactPerson: "Budi Santoso",
      phone: "021-3841234",
      email: "order@kftd.co.id",
      address: "Jl. Banten No. 12, Bandung",
    },
    {
      code: "PBF-API-02",
      name: "PT Anugrah Pharmindo Lestari",
      contactPerson: "Siti Rahma",
      phone: "021-5201234",
      email: "sales@apl.co.id",
      address: "Jl. Soekarno Hatta No. 450, Bandung",
    },
    {
      code: "PBF-ENV-03",
      name: "PT Enseval Putera Megatrading",
      contactPerson: "Agus Salim",
      phone: "021-7591234",
      email: "cs@enseval.co.id",
      address: "Jl. Raya Bogor KM 26, Jakarta Timur",
    },
  ];
  for (const s of suppliersData) {
    suppliers.push(await prisma.supplier.create({ data: s }));
  }
  console.log("3 Suppliers Created\n");

  const itemsSeed: ItemSeed[] = [
    {
      code: "OBT-OTC-001",
      name: "Paracetamol 500mg Tablet",
      category: ItemCategory.OBAT_OTC,
      unit: "Strip",
      minStock: 20,
      maxStock: 200,
      description: "Analgesik dan antipiretik penurun demam.",
      buyPrice: 3500,
      sellPrice: 6000,
      batches: [
        { quantity: 120, expiresInMonths: 18 },
        { quantity: 60, expiresInMonths: 9 },
      ],
    },
    {
      code: "OBT-OTC-002",
      name: "Amoxicillin Dry Syrup 125mg/5ml",
      category: ItemCategory.OBAT_OTC,
      unit: "Botol",
      minStock: 15,
      maxStock: 100,
      description: "Antibiotik golongan penisilin.",
      buyPrice: 8000,
      sellPrice: 13000,
      batches: [{ quantity: 80, expiresInMonths: 14 }],
    },
    {
      code: "OBT-OTC-003",
      name: "Cetirizine 10mg Tablet",
      category: ItemCategory.OBAT_OTC,
      unit: "Strip",
      minStock: 25,
      maxStock: 250,
      description: "Antihistamin untuk alergi.",
      buyPrice: 2500,
      sellPrice: 5000,
      batches: [
        { quantity: 160, expiresInMonths: 20 },
        { quantity: 60, expiresInMonths: 10 },
      ],
    },
    {
      code: "OBT-OTC-004",
      name: "Antasida DOEN Syrup 60ml",
      category: ItemCategory.OBAT_OTC,
      unit: "Botol",
      minStock: 20,
      maxStock: 150,
      description: "Obat maag antasida.",
      buyPrice: 6500,
      sellPrice: 11000,
      batches: [{ quantity: 120, expiresInMonths: 12 }],
    },
    {
      code: "OBT-OTC-005",
      name: "Vitamin C 1000mg Effervescent",
      category: ItemCategory.OBAT_OTC,
      unit: "Tablet",
      minStock: 30,
      maxStock: 300,
      description: "Suplemen vitamin C.",
      buyPrice: 4500,
      sellPrice: 8000,
      batches: [
        { quantity: 200, expiresInMonths: 22 },
        { quantity: 70, expiresInMonths: 11 },
      ],
    },
    {
      code: "OBT-OTC-006",
      name: "Oralit (ORS) Sachet",
      category: ItemCategory.OBAT_OTC,
      unit: "Box",
      minStock: 40,
      maxStock: 400,
      description: "Garam rehidrasi oral.",
      buyPrice: 1800,
      sellPrice: 3500,
      batches: [
        { quantity: 300, expiresInMonths: 24 },
        { quantity: 80, expiresInMonths: 13 },
      ],
    },
    {
      code: "BHN-RAC-001",
      name: "Paracetamol Serbuk Murni",
      category: ItemCategory.BAHAN_RACIKAN,
      unit: "Gram",
      minStock: 100,
      maxStock: 1000,
      description: "Bahan baku serbuk puyer racikan anak.",
      buyPrice: 900,
      sellPrice: 1500,
      batches: [
        { quantity: 700, expiresInMonths: 24 },
        { quantity: 200, expiresInMonths: 12 },
      ],
    },
    {
      code: "BHN-RAC-002",
      name: "Amoxicillin Serbuk Murni",
      category: ItemCategory.BAHAN_RACIKAN,
      unit: "Gram",
      minStock: 100,
      maxStock: 800,
      description: "Bahan baku antibiotik racikan.",
      buyPrice: 1400,
      sellPrice: 2200,
      batches: [{ quantity: 550, expiresInMonths: 18 }],
    },
    {
      code: "BHN-RAC-003",
      name: "Laktosum (Bahan Pengisi)",
      category: ItemCategory.BAHAN_RACIKAN,
      unit: "Gram",
      minStock: 150,
      maxStock: 1500,
      description: "Eksipien pengisi kapsul & puyer.",
      buyPrice: 300,
      sellPrice: 600,
      batches: [
        { quantity: 1000, expiresInMonths: 24 },
        { quantity: 400, expiresInMonths: 12 },
      ],
    },
    {
      code: "BHN-RAC-004",
      name: "Kapsul Kosong No. 0",
      category: ItemCategory.BAHAN_RACIKAN,
      unit: "Buah",
      minStock: 500,
      maxStock: 5000,
      description: "Kapsul kosong gelatin size 0.",
      buyPrice: 80,
      sellPrice: 150,
      batches: [{ quantity: 3500, expiresInMonths: 24 }],
    },
    {
      code: "NON-OBT-001",
      name: "Alkohol 70% Antiseptik 100ml",
      category: ItemCategory.NON_OBAT,
      unit: "Botol",
      minStock: 10,
      maxStock: 50,
      description: "Cairan antiseptik pembersih luka/peralatan.",
      buyPrice: 9000,
      sellPrice: 15000,
      batches: [{ quantity: 42, expiresInMonths: 16 }],
    },
    {
      code: "NON-OBT-002",
      name: "Povidone Iodine 10% 60ml",
      category: ItemCategory.NON_OBAT,
      unit: "Botol",
      minStock: 15,
      maxStock: 100,
      description: "Antiseptik luar luka.",
      buyPrice: 11000,
      sellPrice: 18500,
      batches: [{ quantity: 78, expiresInMonths: 14 }],
    },
    {
      code: "NON-OBT-003",
      name: "Sarung Tangan Latex (Box 100)",
      category: ItemCategory.NON_OBAT,
      unit: "Box",
      minStock: 12,
      maxStock: 120,
      description: "APD pemeriksaan sekali pakai.",
      buyPrice: 25000,
      sellPrice: 40000,
      batches: [{ quantity: 96, expiresInMonths: 24 }],
    },
    {
      code: "NON-OBT-004",
      name: "Kapas Steril 50gr",
      category: ItemCategory.NON_OBAT,
      unit: "Pack",
      minStock: 20,
      maxStock: 200,
      description: "Kapas medis steril.",
      buyPrice: 7000,
      sellPrice: 12000,
      batches: [{ quantity: 150, expiresInMonths: 24 }],
    },
    {
      code: "NON-OBT-005",
      name: "Termometer Digital",
      category: ItemCategory.NON_OBAT,
      unit: "Unit",
      minStock: 5,
      maxStock: 40,
      description: "Alat ukur suhu tubuh digital.",
      buyPrice: 45000,
      sellPrice: 75000,
      batches: [{ quantity: 30, expiresInMonths: 24 }],
    },
  ];

  const itemsWithBatches: {
    item: { id: string };
    seed: ItemSeed;
    batches: {
      id: string;
      batchNumber: string;
      expiryDate: Date;
      initialQuantity: number;
    }[];
  }[] = [];

  for (const seed of itemsSeed) {
    const item = await prisma.item.create({
      data: {
        code: seed.code,
        name: seed.name,
        category: seed.category,
        unit: seed.unit,
        minStock: seed.minStock,
        maxStock: seed.maxStock,
        description: seed.description,
      },
    });

    const batches = [];
    let seq = 1;
    for (const b of seed.batches) {
      const expiryDate = addMonths(today, b.expiresInMonths);
      const yy = String(expiryDate.getFullYear()).slice(2);
      const mm = String(expiryDate.getMonth() + 1).padStart(2, "0");
      const batchNumber = `${seed.code}-B${seq}${yy}${mm}`;

      const batch = await prisma.batch.create({
        data: {
          batchNumber,
          itemId: item.id,
          quantity: b.quantity,
          initialQuantity: b.quantity,
          expiryDate,
          buyPrice: seed.buyPrice,
          sellPrice: seed.sellPrice,
        },
      });
      batches.push(batch);
      seq++;
    }

    itemsWithBatches.push({ item, seed, batches });
  }
  console.log(`${itemsSeed.length} Items Created (all healthy)\n`);

  const ym = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}`;
  let poSeq = 1;

  for (let i = 0; i < suppliers.length; i++) {
    const supplier = suppliers[i];
    const assignedItems = itemsWithBatches.filter(
      (_, idx) => idx % suppliers.length === i,
    );

    const flatLines = assignedItems.flatMap((entry) =>
      entry.batches.map((batch) => ({ batch, entry })),
    );

    const totalAmount = flatLines.reduce(
      (acc, line) =>
        acc + line.batch.initialQuantity * line.entry.seed.buyPrice,
      0,
    );

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: `PO-${ym}-${String(poSeq).padStart(3, "0")}`,
        supplierId: supplier.id,
        createdById: logistikUser.id,
        status: POStatus.COMPLETED,
        totalAmount,
        expectedDeliveryAt: addDays(today, -8),
        receivedAt: addDays(today, -7),
        notes: `Penerimaan rutin dari ${supplier.name}.`,
        items: {
          create: flatLines.map(({ batch, entry }) => ({
            itemId: entry.item.id,
            batchNumber: batch.batchNumber,
            quantity: batch.initialQuantity,
            receivedQty: batch.initialQuantity,
            expiryDate: batch.expiryDate,
            unitPrice: entry.seed.buyPrice,
          })),
        },
      },
      include: { items: true },
    });

    const receipt = await prisma.stockReceipt.create({
      data: {
        receiptNumber: `RCV-${ym}-${String(poSeq).padStart(3, "0")}`,
        purchaseOrderId: po.id,
        supplierId: supplier.id,
        createdById: logistikUser.id,
        invoiceNumber: `INV-${supplier.code}-${String(poSeq).padStart(3, "0")}`,
        receivedAt: addDays(today, -7),
        notes: `Penerimaan lengkap untuk ${po.poNumber}.`,
      },
    });

    await prisma.stockReceiptItem.createMany({
      data: po.items.map((poi) => {
        const line = flatLines.find(
          (l) => l.batch.batchNumber === poi.batchNumber,
        )!;
        return {
          stockReceiptId: receipt.id,
          purchaseOrderItemId: poi.id,
          itemId: poi.itemId,
          batchId: line.batch.id,
          quantity: poi.quantity,
          unitPrice: poi.unitPrice,
        };
      }),
    });

    await prisma.supplier.update({
      where: { id: supplier.id },
      data: { Delivered: 1, TotalDelivery: 1 },
    });

    console.log(
      `${po.poNumber} (${supplier.code}) -> ${receipt.receiptNumber}: ${po.items.length} batch diterima`,
    );
    poSeq++;
  }
  console.log("");

  const cutoff = addDays(new Date(), 30);
  const unhealthy = itemsWithBatches.filter(({ item, seed, batches }) => {
    const totalStock = batches.reduce((acc, b) => acc + b.initialQuantity, 0);
    const nearestExpiry = batches.reduce<Date | null>(
      (nearest, b) =>
        !nearest || b.expiryDate < nearest ? b.expiryDate : nearest,
      null,
    );
    const stockOk = totalStock > seed.minStock;
    const expiryOk = nearestExpiry ? nearestExpiry > cutoff : true;
    return !(stockOk && expiryOk);
  });

  if (unhealthy.length > 0) {
    console.warn(
      "PERINGATAN! Item belum sehat:",
      unhealthy.map((u) => u.seed.code),
    );
  } else {
    console.log(
      "Sanity check OK: semua item sehat -> Inventory Health Score = 100%\n",
    );
  }

  await prisma.aiInsight.create({
    data: {
      type: InsightType.EXECUTIVE_SUMMARY,
      title: "Ringkasan Kesehatan Inventaris",
      summary:
        "Seluruh inventaris dalam kondisi sangat baik (Health Score 100%). Tidak ada item dengan stok kritis dan tidak ada batch yang mendekati kedaluwarsa dalam 30 hari.",
      data: {
        healthScore: 100,
        criticalCount: 0,
        nearExpiryCount: 0,
        recommendedAction:
          "Pertahankan pemantauan stok mingguan dan FEFO saat penjualan.",
      },
    },
  });

  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: "Data Awal Berhasil Dimuat",
      message:
        "Seeding selesai: 20 pengguna, 15 item, 3 supplier. Seluruh stok dalam kondisi sehat (Health Score 100%).",
      type: NotificationType.SYSTEM_INFO,
      actionLink: "/dashboard",
    },
  });

  console.log("AI Insights & Notifications Created");
  console.log("\nSeeding Completed Successfully!");
}

main()
  .catch((error) => {
    console.error("Seeding Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
