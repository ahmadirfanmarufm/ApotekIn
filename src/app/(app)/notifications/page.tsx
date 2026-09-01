import { NotificationsClient } from "@/components/navbar/NotificationsClient";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Pusat Notifikasi
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola semua notifikasi sistem, peringatan stok, dan peringatan
          kedaluwarsa apotek dalam satu tempat.
        </p>
      </div>

      <NotificationsClient />
    </div>
  );
}
