import { Button } from "@/components/ui/button";
import { InventoryHealthCard } from "@/components/dashboard/InventoryHealthCard";
import { AiSummaryCard } from "@/components/dashboard/AiSummaryCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { RevenueChartCard } from "@/components/dashboard/RevenueChartCard";
import { PrioritiesList } from "@/components/dashboard/PrioritiesList";
import { StockAlertsCard } from "@/components/dashboard/StockAlertsCard";
import { TopUsageCard } from "@/components/dashboard/TopUsageCard";
import { ActiveSuppliersCard } from "@/components/dashboard/ActiveSuppliersCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6 font-inter text-slate-800 pb-12">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold font-manrope text-slate-950">
            Dasbor Apotek
          </h1>
          <p className="text-slate-500 mt-1">
            Kondisi terkini inventaris dan logistik
          </p>
        </div>
        <div className="flex">
          <Button
            variant="outline"
            className="bg-white text-slate-700 border-slate-200 shadow-sm"
          >
            {today}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          <InventoryHealthCard />
          <div className="lg:col-span-2">
            <AiSummaryCard />
          </div>
          <QuickActionsCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <RevenueChartCard />
          <PrioritiesList />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 min-[1300px]:grid-cols-3 2xl:grid-cols-4 gap-6 items-stretch">
          <TopUsageCard />
          <StockAlertsCard />
          <ActiveSuppliersCard />
          <RecentActivityCard />
        </div>
      </div>
    </div>
  );
}
