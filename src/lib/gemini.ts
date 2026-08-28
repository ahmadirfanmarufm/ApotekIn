/**
 * Lightweight wrapper around the Google Gemini API (REST).
 *
 * Why REST instead of @google/generative-ai SDK:
 * - Avoids adding another dependency (one less breaking-change risk)
 * - Smaller surface area, easier to mock in tests
 * - Native fetch with Next.js's caching & abort support
 *
 * The wrapper is intentionally minimal: only what the executive-summary
 * polisher needs. If the project later needs chat/streaming/vision, this
 * can be extended.
 */

const DEFAULT_MODEL = "gemini-2.0-flash";
const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

export interface GeminiGenerateOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: "application/json" | "text/plain";
  /** Abort signal to cancel in-flight requests. */
  signal?: AbortSignal;
}

export interface GeminiGenerateResult {
  text: string;
  model: string;
  promptTokens: number | null;
  candidateTokens: number | null;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
}

/**
 * Returns true if the project has a Gemini API key configured.
 * Used to short-circuit and skip the network call entirely.
 */
export function isGeminiConfigured(): boolean {
  return Boolean(process.env["GEMINI_API_KEY"]);
}

function getModelName(): string {
  return process.env["GEMINI_MODEL"] || DEFAULT_MODEL;
}

/**
 * Generates text via Gemini. Throws on non-2xx response.
 *
 * @throws Error if API key is missing, request fails, or response is malformed
 */
export async function generateWithGemini(
  prompt: string,
  options: GeminiGenerateOptions = {},
): Promise<GeminiGenerateResult> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const model = getModelName();
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.4,
      maxOutputTokens: options.maxOutputTokens ?? 512,
      ...(options.responseMimeType
        ? { responseMimeType: options.responseMimeType }
        : {}),
    },
  };

  if (options.systemInstruction) {
    body["systemInstruction"] = {
      role: "system",
      parts: [{ text: options.systemInstruction }],
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: options.signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Gemini API error (${res.status} ${res.statusText}): ${detail.slice(0, 300)}`,
    );
  }

  const json = (await res.json()) as GeminiResponse;
  const text = json.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return {
    text,
    model,
    promptTokens: json.usageMetadata?.promptTokenCount ?? null,
    candidateTokens: json.usageMetadata?.candidatesTokenCount ?? null,
  };
}
