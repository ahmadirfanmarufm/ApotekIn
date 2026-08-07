# Laporan Pengembangan Fitur Login - ApotekIn

**Project**: ApotekIn (Sistem Manajemen Apotek Digital)  
**Branch**: `feat/login-page`  
**Tanggal**: 6 Agustus 2026  

---

## 📌 Ringkasan Pengerjaan

Pada sesi pengembangan ini, telah berhasil dibangun fitur autentikasi dan halaman login lengkap untuk aplikasi **ApotekIn** menggunakan **Next.js (App Router)**, **TypeScript**, **Zod**, **NextAuth.js**, dan **Tailwind CSS v4**.

---

## 📁 Daftar File pada Branch `feat/login-page`

### File Baru (New Files)

| No | Path File | Status | Fungsi |
|----|-----------|--------|--------|
| 1 | `src/lib/validations/auth.ts` | 🆕 Baru | Skema validasi input login menggunakan **Zod**. Memastikan format email valid dan password minimal 6 karakter sebelum dikirim ke server. |
| 2 | `src/lib/auth.ts` | 🆕 Baru | Konfigurasi `authOptions` **NextAuth.js** dengan `CredentialsProvider`. Melakukan verifikasi email & password, lalu menyimpan `id` dan `role` pengguna ke JWT Token & Session. |
| 3 | `src/app/api/auth/[...nextauth]/route.ts` | 🆕 Baru | Route handler API Next.js untuk menangani seluruh endpoint autentikasi NextAuth (`/api/auth/*`), mengekspor handler GET & POST. |
| 4 | `src/app/login/page.tsx` | 🆕 Baru | Halaman UI Login (`/login`) yang bersifat Client Component. Menampilkan split-screen layout: sisi kiri berupa foto latar farmasi dengan teks overlay, sisi kanan berupa form login interaktif dengan validasi Zod, toggle password, error alert, loading state, dan tombol demo. |
| 5 | `src/components/providers/SessionProvider.tsx` | 🆕 Baru | Wrapper komponen Client Component untuk `NextAuth.js SessionProvider`. Diperlukan karena Server Component tidak bisa secara langsung memuat context client-side dari NextAuth. |
| 6 | `public/images/pharmacy_bg.png` | 🆕 Baru | Gambar latar sisi kiri halaman login berupa interior laboratorium farmasi modern berwarna mint & putih bersih. |
| 7 | `public/images/logo.png` | 🆕 Baru | Logo resmi **ApotekIn** (ikon palang medis hijau + teks "Apotekin") yang ditampilkan di bagian atas form login, di atas heading "Selamat Datang kembali". |
| 8 | `Laporan.MD` | 🆕 Baru | Dokumen laporan pengembangan fitur login pada branch ini (file ini). |

### File Diubah (Modified Files)

| No | Path File | Status | Perubahan |
|----|-----------|--------|-----------|
| 1 | `src/app/layout.tsx` | ✏️ Diubah | Menambahkan import `SessionProvider` dan membungkus `{children}` dengan `<SessionProvider>` agar seluruh halaman dalam aplikasi dapat mengakses session NextAuth. Juga memperbaiki tipe prop `children` menjadi `React.ReactNode` (standar). |

---

## 🛠️ Penjelasan Teknis Per Komponen

### 1. Skema Validasi Input — `src/lib/validations/auth.ts`
Menggunakan library **Zod** untuk mendefinisikan aturan validasi input form login:
- **Email**: Wajib diisi, harus berformat email yang valid.
- **Password**: Wajib diisi, minimal 6 karakter.
- Mengekspor tipe `LoginInput` dari schema Zod untuk digunakan di komponen form.

### 2. Konfigurasi Autentikasi — `src/lib/auth.ts`
File konfigurasi utama NextAuth.js:
- Menggunakan **CredentialsProvider** untuk autentikasi berbasis email & password.
- Callback `jwt` menyisipkan `id` dan `role` ke dalam JWT token.
- Callback `session` meneruskan `id` dan `role` ke objek session yang dapat diakses komponen.
- Mengarahkan halaman login ke `/login`.

### 3. API Route Handler — `src/app/api/auth/[...nextauth]/route.ts`
Endpoint API yang menangkap semua request ke `/api/auth/*` (login, logout, session, dsb). Mengekspor handler yang sama untuk metode GET dan POST sesuai standar Next.js App Router.

### 4. Halaman Login — `src/app/login/page.tsx`
Komponen Client (`"use client"`) yang mengelola seluruh logika dan tampilan halaman login:
- **Validasi Zod** di sisi client sebelum request dikirim.
- **`signIn("credentials", ...)`** dari NextAuth untuk memproses autentikasi.
- **State management**: `formData`, `fieldErrors`, `errorMessage`, `loading`, `showPassword`, `rememberMe`.
- **UI**: Logo resmi ApotekIn, split-screen layout, input fields, toggle password, alert error, tombol submit dengan loading spinner, dan tombol Demo.

### 5. Session Provider — `src/components/providers/SessionProvider.tsx`
Komponen tipis yang membungkus `<SessionProvider>` dari `next-auth/react` dengan direktif `"use client"`, sehingga dapat diimpor dan digunakan di dalam Server Component (`layout.tsx`).

### 6. Root Layout — `src/app/layout.tsx`
Dimodifikasi untuk membungkus seluruh konten aplikasi dengan `<SessionProvider>`, memungkinkan semua halaman menggunakan hook `useSession()` dari NextAuth untuk mengecek status autentikasi pengguna.

---

## 🔑 Kredensial Pengujian (Demo Account)

| Parameter | Kredensial Demo |
| --- | --- |
| **URL Halaman** | `http://localhost:3000/login` |
| **Email** | `admin@apotekin.com` |
| **Password** | `password123` |

---

## 🎯 Kesimpulan & Langkah Selanjutnya

Fitur login telah siap digunakan di branch `feat/login-page`. Langkah selanjutnya yang disarankan:
1. Menghubungkan verifikasi password dengan hashing (misal `bcrypt`) dan database Prisma/PostgreSQL.
2. Menambahkan `middleware.ts` untuk memproteksi route halaman internal (seperti `/dashboard`).


---

## 🛠️ Rincian File yang Dibuat & Diubah

### 1. Skema Validasi Input (Zod)
- **File**: `src/lib/validations/auth.ts`
- **Fungsi**: Memvalidasi input dari pengguna di sisi client sebelum dikirim ke server.
  - Memastikan format email valid.
  - Memastikan password tidak kosong dan memiliki panjang minimal 6 karakter.

### 2. Konfigurasi Autentikasi NextAuth.js
- **File**: `src/lib/auth.ts`
- **Fungsi**: Konfigurasi `authOptions` menggunakan `CredentialsProvider`:
  - Memverifikasi kredensial pengguna.
  - Menyimpan `id` dan `role` pengguna ke dalam JWT Token & Session.
- **File**: `src/app/api/auth/[...nextauth]/route.ts`
  - Handler API GET & POST untuk menangani endpoint autentikasi `/api/auth/*`.

### 3. Provider Session & Root Layout
- **File**: `src/components/providers/SessionProvider.tsx`
  - Komponen wrapper Client Component untuk `NextAuth.js SessionProvider`.
- **File**: `src/app/layout.tsx`
  - Membungkus struktur utama aplikasi dengan `<SessionProvider>` agar seluruh komponen dapat mengakses status autentikasi.

### 4. Tampilan Halaman Login (UI)
- **File**: `src/app/login/page.tsx`
- **Asset**: `public/images/pharmacy_bg.png`
- **Fungsi & Desain**:
  - **Split-Screen Layout**:
    - **Sisi Kiri**: Background foto interior laboratorium farmasi bersih dengan teks overlay *"Meningkatkan Operasional Farmasi - Precision, clarity, and security built for modern healthcare environments"*.
    - **Sisi Kanan**: Panel form putih bersih dengan sudut kiri melengkung (`rounded-l-[32px]`).
  - **Branding**: Logo SVG khusus **ApotekIn+** (Palang medis hijau dengan panah diagonal ke atas).
  - **Interaktivitas**:
    - Toggle lihat/sembunyikan password (ikon mata).
    - Penanganan pesan error alert (global & per-field).
    - Loading spinner saat proses autentikasi.
    - Checkbox *"Ingat selama 30 hari"* & link *"Lupa kata sandi?"*.
    - Tombol cepat **"Gunakan Kredensial Demo"** untuk pengujian langsung.

### 5. Setup Lingkungan Pengembangan (Environment)
- Berhasil menginstal **Node.js LTS (v24.19.0)** & **pnpm**.
- Berhasil menginstal 374 paket dependensi project (`pnpm install`).
- Server dev berjalan aktif di `http://localhost:3000`.

---

## 🔑 Kredensial Pengujian (Demo Account)

| Parameter | Kredensial Demo |
| --- | --- |
| **URL Halaman** | `http://localhost:3000/login` |
| **Email** | `admin@apotekin.com` |
| **Password** | `password123` |

---

## 🎯 Kesimpulan & Langkah Selanjutnya

Fitur login telah siap digunakan di branch `feat/login-page`. Langkah selanjutnya yang disarankan:
1. Menghubungkan verifikasi password dengan hashing (misal `bcrypt`) dan database Prisma/PostgreSQL.
2. Menambahkan `middleware.ts` untuk memproteksi route halaman internal (seperti `/dashboard`).
