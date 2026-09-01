import { Role } from "@/prisma/config";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ADMINISTRATOR: ["*"],

  APOTEKER_PENANGGUNG_JAWAB: [
    "dashboard.view",

    "inventory.view",
    "inventory.create",
    "inventory.update",

    "stock_in.view",
    "stock_in.create",
    "stock_in.update",

    "stock_out.view",
    "stock_out.create",

    "purchase_order.view",
    "purchase_order.approve",

    "supplier.view",

    "reports.view",
    "reports.export",

    "ai_insight.view",
    "ai_insight.generate",

    "notifications.view",
  ],

  TENAGA_TEKNIS_KEFARMASIAN: [
    "dashboard.view",

    "inventory.view",

    "stock_in.view",

    "stock_out.view",
    "stock_out.create",

    "notifications.view",

    "audit_stock.view",
  ],

  ADMIN_LOGISTIK: [
    "dashboard.view",

    "inventory.view",
    "inventory.create",
    "inventory.update",

    "stock_in.view",
    "stock_in.create",
    "stock_in.update",

    "stock_out.view",
    "stock_out.create",
    "stock_out.update",

    "purchase_order.view",
    "purchase_order.create",
    "purchase_order.update",

    "supplier.view",
    "supplier.create",
    "supplier.update",

    "reports.view",

    "notifications.view",
    "notifications.manage",
  ],

  OWNER: [
    "dashboard.view",

    "inventory.view",

    "reports.view",
    "reports.export",

    "ai_insight.view",

    "notifications.view",
  ],
};