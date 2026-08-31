const DEFAULT_MODEL = "gemini-3.5-flash-lite";

export class GeminiConfigError extends Error {}
export class GeminiApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

interface GeminiSchema {
  type: string;
  properties?: Record<string, unknown>;
  items?: GeminiSchema;
  enum?: string[];
  required?: string[];
  nullable?: boolean;
  [key: string]: unknown;
}

export async function generateStructuredContent<T>(params: {
  prompt: string;
  schema: GeminiSchema;
  temperature?: number;
}): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new GeminiConfigError(
      "GEMINI_API_KEY belum diset. Tambahkan di file .env (lihat komentar di lib/gemini.ts untuk cara mendapatkannya secara gratis).",
    );
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: params.prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: params.schema,
        temperature: params.temperature ?? 0.4,
      },
    }),
    // Insight tidak butuh realtime; beri jeda wajar sebelum dianggap gagal.
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");

    if (response.status === 429) {
      let retrySeconds: number | null = null;
      try {
        const parsed = JSON.parse(errorText);
        const retryDetail = parsed?.error?.details?.find(
          (d: { "@type"?: string }) => d["@type"]?.includes("RetryInfo"),
        );
        const rawDelay: string | undefined = retryDetail?.retryDelay;
        if (rawDelay) retrySeconds = Math.ceil(parseFloat(rawDelay));
      } catch {
        // biarkan retrySeconds tetap null kalau body tidak bisa di-parse
      }

      throw new GeminiApiError(
        retrySeconds
          ? `Kuota gratis Gemini untuk model ini sudah tercapai. Coba lagi dalam ${retrySeconds} detik, atau ganti GEMINI_MODEL di .env ke model dengan kuota lebih besar (mis. gemini-2.5-flash-lite).`
          : "Kuota gratis Gemini untuk model ini sudah tercapai. Tunggu sebentar, atau ganti GEMINI_MODEL di .env ke model dengan kuota lebih besar.",
        429,
      );
    }

    throw new GeminiApiError(
      `Gemini API mengembalikan error ${response.status}: ${errorText || response.statusText}`,
      response.status,
    );
  }

  const payload = await response.json();
  const text: string | undefined =
    payload?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new GeminiApiError(
      "Gemini tidak mengembalikan konten yang bisa dibaca. Kemungkinan diblokir oleh safety filter.",
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new GeminiApiError(
      "Gemini mengembalikan teks yang bukan JSON valid meski responseSchema sudah diset.",
    );
  }
}
