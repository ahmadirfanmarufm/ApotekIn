import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/config";
import { buildInsightDigest } from "@/lib/insights-data";
import { GeminiApiError, GeminiConfigError, generateStructuredContent } from "@/lib/gemini";
import type { InsightResponse, InsightResult } from "@/types/insight";

// Berapa lama insight yang sudah pernah digenerate dianggap masih "segar"
// sebelum boleh otomatis di-generate ulang saat halaman dibuka (GET biasa).
const AUTO_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 jam

// Jeda minimum antar-klik tombol "Buat Ulang" (POST) supaya tidak
// membakar kuota free tier Gemini (15 request/menit) hanya karena
// pengguna klik berkali-kali.
const MANUAL_REGENERATE_COOLDOWN_MS = 2 * 60 * 1000; // 2 menit

const INSIGHT_TYPE = "EXECUTIVE_SUMMARY" as const;

const insightSchema = {
  type: "object",
  properties: {
    headline: {
      type: "string",
      description:
        "Satu-dua kalimat ringkasan eksekutif kondisi apotek saat ini, dalam Bahasa Indonesia, langsung ke inti.",
    },
    healthAssessment: {
      type: "string",
      description: "Paragraf singkat (2-4 kalimat) menjelaskan kondisi inventaris secara keseluruhan.",
    },
    forecast: {
      type: "string",
      description: "Paragraf singkat prediksi/ekspektasi untuk periode mendatang berdasarkan tren yang ada.",
    },
    risks: {
      type: "array",
      description: "Daftar risiko konkret yang terdeteksi dari data (maksimal 5).",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high"] },
        },
        required: ["title", "detail", "severity"],
      },
    },
    opportunities: {
      type: "array",
      description: "Daftar peluang/hal positif yang bisa dimanfaatkan (maksimal 4).",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
        },
        required: ["title", "detail"],
      },
    },
    stockRecommendations: {
      type: "array",
      description: "Rekomendasi tindakan untuk item-item spesifik yang disebut di data (maksimal 6).",
      items: {
        type: "object",
        properties: {
          itemName: { type: "string" },
          action: { type: "string", enum: ["restock", "reduce", "monitor"] },
          reason: { type: "string" },
          suggestedQuantity: { type: "number", nullable: true },
        },
        required: ["itemName", "action", "reason"],
      },
    },
    supplierNote: {
      type: "string",
      nullable: true,
      description: "Catatan singkat tentang performa supplier jika relevan, atau null jika tidak ada yang perlu disorot.",
    },
  },
  required: [
    "headline",
    "healthAssessment",
    "forecast",
    "risks",
    "opportunities",
    "stockRecommendations",
  ],
};

function buildPrompt(digest: unknown): string {
  return `Anda adalah asisten analisis operasional untuk aplikasi manajemen inventaris apotek bernama ApotekIn.

Tugas Anda: menganalisis data JSON di bawah ini dan memberi ringkasan eksekutif serta rekomendasi tindakan yang PRAKTIS dan SPESIFIK, dalam Bahasa Indonesia.

ATURAN PENTING:
- HANYA gunakan angka dan nama yang ADA di data ini. Jangan mengarang nama obat, supplier, atau angka yang tidak disebutkan.
- Jika suatu daftar di data kosong, jangan buat-buat risiko/rekomendasi palsu untuk kategori itu.
- Gunakan nada profesional, ringkas, dan actionable (fokus ke "apa yang harus dilakukan pengguna"), bukan sekadar mendeskripsikan ulang angka.
- Untuk stockRecommendations, prioritaskan item yang ada di "stokMenipis" (restock) dan "kandidatStokMati" (reduce/monitor).
- Untuk risks, prioritaskan item di "akanKedaluwarsa30Hari" dan penurunan pendapatan jika "pendapatan7HariTerakhir" lebih rendah dari "pendapatan7HariSebelumnya".

Data operasional (per tanggal ${(digest as { tanggalAnalisis: string }).tanggalAnalisis}):
${JSON.stringify(digest, null, 2)}`;
}

async function generateAndStoreInsight() {
  const { digest, snapshot } = await buildInsightDigest();

  const result = await generateStructuredContent<InsightResult>({
    prompt: buildPrompt(digest),
    schema: insightSchema,
  });

  const saved = await prisma.aiInsight.create({
    data: {
      type: INSIGHT_TYPE,
      title: "Ringkasan Eksekutif AI",
      summary: result.headline,
      // JSON.parse(JSON.stringify(...)) memastikan nilainya plain JSON
      // (tanpa undefined/Decimal/dll) supaya cocok dengan tipe Json Prisma.
      data: JSON.parse(JSON.stringify({ result, digest, snapshot })),
    },
  });

  return toResponse(saved, snapshot, false);
}

function toResponse(
  record: {
    id: string;
    title: string;
    data: unknown;
    createdAt: Date;
  },
  fallbackSnapshot: InsightResponse["digestSnapshot"] | null,
  cached: boolean,
): InsightResponse {
  const stored = record.data as {
    result: InsightResult;
    snapshot?: InsightResponse["digestSnapshot"];
  };

  return {
    id: record.id,
    title: record.title,
    result: stored.result,
    generatedAt: record.createdAt.toISOString(),
    cached,
    digestSnapshot:
      stored.snapshot ??
      fallbackSnapshot ?? {
        lowStockCount: 0,
        expiringSoonCount: 0,
        revenueLast7Days: 0,
        revenuePrev7Days: 0,
        topSellingItem: null,
        worstSupplier: null,
      },
  };
}

export async function GET() {
  try {
    const latest = await prisma.aiInsight.findFirst({
      where: { type: INSIGHT_TYPE },
      orderBy: { createdAt: "desc" },
    });

    const isFresh = latest && now().getTime() - latest.createdAt.getTime() < AUTO_CACHE_TTL_MS;

    if (latest && isFresh) {
      return NextResponse.json({ success: true, data: toResponse(latest, null, true) });
    }

    const generated = await generateAndStoreInsight();
    return NextResponse.json({ success: true, data: generated });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST() {
  try {
    const latest = await prisma.aiInsight.findFirst({
      where: { type: INSIGHT_TYPE },
      orderBy: { createdAt: "desc" },
    });

    if (latest) {
      const elapsed = now().getTime() - latest.createdAt.getTime();
      if (elapsed < MANUAL_REGENERATE_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((MANUAL_REGENERATE_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          {
            success: false,
            message: `Mohon tunggu ${waitSeconds} detik lagi sebelum membuat ulang insight (menjaga kuota API gratis).`,
          },
          { status: 429 },
        );
      }
    }

    const generated = await generateAndStoreInsight();
    return NextResponse.json({ success: true, data: generated });
  } catch (error) {
    return handleError(error);
  }
}

function now() {
  return new Date();
}

function handleError(error: unknown) {
  console.error("AI_INSIGHTS_ERROR:", error);

  if (error instanceof GeminiConfigError) {
    return NextResponse.json(
      { success: false, message: error.message, code: "GEMINI_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  if (error instanceof GeminiApiError) {
    return NextResponse.json(
      { success: false, message: error.message, code: "GEMINI_API_ERROR" },
      { status: 502 },
    );
  }

  return NextResponse.json(
    { success: false, message: "Gagal menghasilkan AI insight." },
    { status: 500 },
  );
}
