# Healtech 2026
Nama TIM: **Asik Asikin Aja CLAN**
Daftar Anggota:
- Damar Syahada Kusuma
- Ahmad Irfan Ma'ruf
- Raihan Yassar Tsaqib


---

## ApotekIn

Aplikasi manajemen inventaris dan operasional apotek berbasis web. Mendukung pelacakan stok per batch (kedaluwarsa & harga), alur pembelian (PO) dengan penerimaan parsial, rekonsiliasi stok (*stock opname*), laporan PDF, dan modul analitik AI.

---

## Fitur Utama

- **Inventaris & Batch Tracking:** Pelacakan item per batch (nomor batch, tanggal kedaluwarsa, HPP, harga jual) serta manajemen stok masuk, stok keluar, dan audit stok (*stock opname*).
- **Purchase Order (PO):** Pengadaan barang ke supplier dengan status dinamis (`PENDING`, `PARTIAL`, `COMPLETED`, `CANCELLED`) dan penerimaan parsial.
- **Role-Based Access Control (RBAC):** Otentikasi dan otorisasi multi-role (`ADMINISTRATOR`, `APOTEKER_PENANGGUNG_JAWAB`, `TENAGA_TEKNIS_KEFARMASIAN`, `ADMIN_LOGISTIK`, `OWNER`).
- **Analitik & AI Insights:** Modul ringkasan operasional, prediksi kebutuhan stok, analisis stok kritis/overstock, serta rekomendasi supplier.
- **Pelaporan:** Ekspor laporan operasional dan keuangan ke format PDF secara dinamis.

---

## Arsitektur & Teknologi

| Komponen | Teknologi |
| --- | --- |
| **Framework** | Next.js 16 (App Router), React 19 |
| **Bahasa** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Database & ORM** | PostgreSQL, Prisma 7 (`@prisma/adapter-pg`) |
| **Autentikasi** | NextAuth.js (JWT, bcryptjs, jose) |
| **Storage** | Supabase Storage |
| **Library UI/PDF** | Lucide Icons, Chart.js, react-chartjs, `@react-pdf/renderer` |
| **Validasi Schema** | Zod |

---

## Memulai Development

### Prasyarat

- Node.js >= 20
- pnpm >= 10
- PostgreSQL Instance

### 1. Instalasi & Setup

```bash
git clone <repository-url>
cd ApotekIn
pnpm install

```

### 2. Environment Variables

Buat file `.env` di root project:

```env
JWT_SECRET=""

NEXTAUTH_URL=""
NEXTAUTH_SECRET=""

DATABASE_URL=""
DIRECT_URL=""

NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
```

### 3. Database Migration & Seeding

```bash
pnpm prisma migrate dev
pnpm prisma db seed

```

### 4. Jalankan Aplikasi

```bash
pnpm dev

```

Aplikasi berjalan di `http://localhost:3000`.

---

## Struktur Direktori

```text
ApotekIn/
├── prisma/
│   ├── schema.prisma       # Skema database
│   └── seed.ts             # Data awal / seed script
├── src/
│   ├── app/
│   │   ├── (app)/          # Protected routes (Dashboard, Inventory, PO, Reports, dll)
│   │   ├── api/            # Route handlers
│   │   └── login/          # Auth route
│   ├── components/         # Komponen UI modular
│   ├── lib/                # Konfigurasi client (Prisma, Supabase, Auth)
│   └── types/              # Type definitions
└── middleware.ts           # Route protection & session validation

```

---

## Scripts

* `pnpm dev` - Jalankan development server
* `pnpm build` - Build aplikasi untuk produksi
* `pnpm start` - Jalankan build produksi
* `pnpm lint` - Jalankan linter
* `pnpm prisma studio` - Buka database GUI