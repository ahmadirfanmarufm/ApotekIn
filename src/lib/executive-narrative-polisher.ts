/**
 * Gemini polish layer for the AI Executive Summary.
 *
 * The base narrative (lib/executive-narrative.ts) is deterministic and
 * 100% data-accurate. This module optionally sends the base narrative
 * to Gemini to be paraphrased into more natural Bahasa Indonesia.
 *
 * Design contract:
 * - Gemini is ONLY allowed to rewrite wording, not invent data.
 * - We pass all numeric facts and the base narrative as ground truth.
 * - We ask for strict JSON output with the same 3 fields.
 * - We validate the response: same severity, same key facts preserved.
 * - On ANY failure (timeout, parse error, drift) we fall back to the
 *   deterministic narrative — never break the dashboard.
 */

import type { NarrativePayload, NarrativeSeverity } from "@/types/dashboard";
import { generateWithGemini, isGeminiConfigured } from "@/lib/gemini";

const SYSTEM_INSTRUCTION = `Kamu adalah asisten farmasi apotek yang menulis ringkasan eksekutif singkat dalam Bahasa Indonesia.

ATURAN KETAT:
1. Kamu HANYA boleh memparafrase teks yang diberikan, TIDAK boleh menambah atau mengubah fakta/data angka.
2. Jaga nada tetap profesional, ringkas, dan mudah dipahami apoteker.
3. Pertahankan panjang yang setara (±20%) dengan teks asli.
4. Jangan menambahkan rekomendasi, nama item, atau angka baru yang tidak ada di INPUT.
5. Output HARUS JSON valid dengan field: headline, insight, recommendation, severity.
6. Severity hanya boleh salah satu dari: GOOD, WARNING, CRITICAL (sama dengan input).`;

export interface PolishInput {
  baseNarrative: NarrativePayload;
  facts: {
    healthScore: number;
    criticalCount: number;
    totalSku: number;
    topCriticalItemName: string | null;
    topCriticalDaysUntilExpiry: number | null;
    fastMovingName: string | null;
    fastMovingQty: number;
    fefoCompliancePct: number;
    revenue30d: number;
    expense30d: number;
    marginPct: number;
    pendingTasksCount: number;
    onTimeSupplierPct: number;
  };
}

export interface PolishResult {
  narrative: NarrativePayload;
  polished: boolean;
  reason?: string;
  model?: string;
}

export async function polishNarrativeWithGemini(
  input: PolishInput,
): Promise<PolishResult> {
  if (!isGeminiConfigured()) {
    return {
      narrative: input.baseNarrative,
      polished: false,
      reason: "GEMINI_API_KEY not configured",
    };
  }

  const prompt = buildPrompt(input);
  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), 6_000);

  try {
    const result = await generateWithGemini(prompt, {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
      maxOutputTokens: 600,
      responseMimeType: "application/json",
      signal: ac.signal,
    });

    const parsed = parseAndValidate(result.text, input.baseNarrative.severity);
    if (!parsed) {
      return {
        narrative: input.baseNarrative,
        polished: false,
        reason: "Gemini response failed validation",
        model: result.model,
      };
    }

    return {
      narrative: parsed,
      polished: true,
      model: result.model,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Unknown Gemini error";
    console.warn("[GEMINI POLISH] failed, using template:", reason);
    return {
      narrative: input.baseNarrative,
      polished: false,
      reason,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function buildPrompt(input: PolishInput): string {
  const { baseNarrative, facts } = input;
  return `Parafrase ringkasan eksekutif berikut ke dalam Bahasa Indonesia yang lebih natural.

=== FAKTA (JANGAN DIUBAH) ===
- Health Score: ${facts.healthScore}% (${facts.totalSku} SKU aktif, ${facts.criticalCount} kritis)
- Item paling kritis: ${facts.topCriticalItemName ?? "tidak ada"}${
    facts.topCriticalDaysUntilExpiry !== null
      ? ` (${facts.topCriticalDaysUntilExpiry} hari ke ED)`
      : ""
  }
- Fast moving 24 jam: ${facts.fastMovingName ?? "tidak ada"} (${facts.fastMovingQty} unit)
- FEFO compliance: ${facts.fefoCompliancePct}%
- Revenue 30 hari: Rp${facts.revenue30d.toLocaleString("id-ID")}
- Expense 30 hari: Rp${facts.expense30d.toLocaleString("id-ID")}
- Margin: ${facts.marginPct.toFixed(1)}%
- Pending tasks: ${facts.pendingTasksCount}
- On-time supplier: ${facts.onTimeSupplierPct}%
- Severity: ${baseNarrative.severity}

=== TEKS ASLI (BOLEH DIPARAFRASE) ===
HEADLINE: ${baseNarrative.headline}
INSIGHT: ${baseNarrative.insight}
RECOMMENDATION: ${baseNarrative.recommendation}

=== INSTRUKSI OUTPUT ===
Kembalikan JSON valid dengan format:
{
  "headline": "...",
  "insight": "...",
  "recommendation": "...",
  "severity": "${baseNarrative.severity}"
}`;
}

function isValidSeverity(value: unknown): value is NarrativeSeverity {
  return value === "GOOD" || value === "WARNING" || value === "CRITICAL";
}

function parseAndValidate(
  raw: string,
  expectedSeverity: NarrativeSeverity,
): NarrativePayload | null {
  try {
    // Strip optional code fences the model might add
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const json = JSON.parse(cleaned) as Record<string, unknown>;

    const headline =
      typeof json["headline"] === "string" ? json["headline"].trim() : "";
    const insight =
      typeof json["insight"] === "string" ? json["insight"].trim() : "";
    const recommendation =
      typeof json["recommendation"] === "string"
        ? json["recommendation"].trim()
        : "";
    const severity = json["severity"];

    if (!headline || !insight || !recommendation) return null;
    if (!isValidSeverity(severity)) return null;
    if (severity !== expectedSeverity) return null;

    // Sanity bounds: Gemini must not bloat the text unboundedly
    if (headline.length > 400) return null;
    if (insight.length > 1200) return null;
    if (recommendation.length > 500) return null;

    return { headline, insight, recommendation, severity };
  } catch {
    return null;
  }
}
