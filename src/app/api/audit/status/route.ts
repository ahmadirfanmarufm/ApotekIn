import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuditFreezeStatus } from "@/lib/audit-freeze";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  try {
    const status = await getAuditFreezeStatus();

    return NextResponse.json({
      success: true,
      isFreezeActive: status.isFreezeActive,
      activeAudit: status.activeAudit,
    });
  } catch (error) {
    console.error("GET Audit Freeze Status Error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil status audit." },
      { status: 500 },
    );
  }
}
