import { InsightsClient } from "@/components/ai-insights/InsightsClient";

export default function AiInsightsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-10 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold font-manrope text-slate-950 sm:text-2xl lg:text-3xl">
          AI Insights
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Ringkasan, prediksi, dan rekomendasi tindakan berbasis AI dari data
          operasional apotek Anda.
        </p>
      </div>

      <InsightsClient />
    </div>
  );
}
