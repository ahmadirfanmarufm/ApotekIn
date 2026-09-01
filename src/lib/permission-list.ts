export const PERMISSION_GROUPS = [
  {
    label: "Dashboard",
    permissions: [
      {
        code: "dashboard.view",
        label: "Melihat Dashboard",
      },
    ],
  },

  {
    label: "Inventory",
    permissions: [
      {
        code: "inventory.view",
        label: "Melihat Inventory",
      },
      {
        code: "inventory.create",
        label: "Menambah Inventory",
      },
      {
        code: "inventory.update",
        label: "Mengubah Inventory",
      },
      {
        code: "inventory.delete",
        label: "Menghapus Inventory",
      },
    ],
  },

  {
    label: "Stok Masuk",
    permissions: [
      {
        code: "stock_in.view",
        label: "Melihat Stok Masuk",
      },
      {
        code: "stock_in.create",
        label: "Menambahkan Stok Masuk",
      },
      {
        code: "stock_in.update",
        label: "Mengubah Stok Masuk",
      },
    ],
  },

  {
    label: "Stok Keluar",
    permissions: [
      {
        code: "stock_out.view",
        label: "Melihat Stok Keluar",
      },
      {
        code: "stock_out.create",
        label: "Menambahkan Stok Keluar",
      },
      {
        code: "stock_out.update",
        label: "Mengubah Stok Keluar",
      },
    ],
  },

  {
    label: "Purchase Order",
    permissions: [
      {
        code: "purchase_order.view",
        label: "Melihat Purchase Order",
      },
      {
        code: "purchase_order.create",
        label: "Membuat Purchase Order",
      },
      {
        code: "purchase_order.update",
        label: "Mengubah Purchase Order",
      },
      {
        code: "purchase_order.approve",
        label: "Menyetujui Purchase Order",
      },
    ],
  },

  {
    label: "Supplier",
    permissions: [
      {
        code: "supplier.view",
        label: "Melihat Supplier",
      },
      {
        code: "supplier.create",
        label: "Menambahkan Supplier",
      },
      {
        code: "supplier.update",
        label: "Mengubah Supplier",
      },
      {
        code: "supplier.delete",
        label: "Menghapus Supplier",
      },
    ],
  },

  {
    label: "Audit Stock",
    permissions: [
      {
        code: "audit_stock.view",
        label: "Melihat Audit Stock",
      },
      {
        code: "audit_stock.export",
        label: "Export Audit Stock",
      },
    ],
  },

  {
    label: "Reports",
    permissions: [
      {
        code: "reports.view",
        label: "Melihat Reports",
      },
      {
        code: "reports.export",
        label: "Export Reports",
      },
    ],
  },

  {
    label: "AI Insight",
    permissions: [
      {
        code: "ai_insight.view",
        label: "Melihat AI Insight",
      },
      {
        code: "ai_insight.generate",
        label: "Generate AI Insight",
      },
    ],
  },

  {
    label: "Notifications",
    permissions: [
      {
        code: "notifications.view",
        label: "Melihat Notifikasi",
      },
      {
        code: "notifications.manage",
        label: "Mengelola Notifikasi",
      },
    ],
  },

  {
    label: "User Management",
    permissions: [
      {
        code: "user_management.view",
        label: "Melihat Manajemen User",
      },
      {
        code: "user_management.create",
        label: "Menambahkan User",
      },
      {
        code: "user_management.update",
        label: "Mengubah User",
      },
      {
        code: "user_management.delete",
        label: "Menghapus User",
      },
      {
        code: "permission.manage",
        label: "Mengatur Permission User",
      },
    ],
  },

  {
    label: "Settings",
    permissions: [
      {
        code: "settings.view",
        label: "Melihat Settings",
      },
      {
        code: "settings.update",
        label: "Mengubah Settings",
      },
    ],
  },
] as const;