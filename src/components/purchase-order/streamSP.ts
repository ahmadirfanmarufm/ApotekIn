"use client";

import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import type { PurchaseOrderDetail } from "@/types/purchase-order";

export async function streamPurchaseOrderPDF(po: PurchaseOrderDetail) {
  const { SPDocument } = await import("./SPDocument");

  const blob = await pdf(
    createElement(SPDocument, {
      po,
    }) as unknown as ReactElement<DocumentProps>,
  ).toBlob();
  const url = URL.createObjectURL(blob);

  window.open(url, "_blank");

  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
