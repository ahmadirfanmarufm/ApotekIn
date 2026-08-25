import { Truck, BadgeCheck } from "lucide-react";

interface SupplierMetricsProps {
  activeSuppliersCount: number;
  totalDeliveredCount: number;
}

export function SupplierMetrics({
  activeSuppliersCount,
  totalDeliveredCount,
}: SupplierMetricsProps) {
  const metrics = [
    {
      title: "ACTIVE SUPPLIERS",
      value: activeSuppliersCount,
      Icon: Truck,
      iconColor: "text-emerald-700",
    },
    {
      title: "TOTAL DELIVERED ORDERS",
      value: totalDeliveredCount,
      Icon: BadgeCheck,
      iconColor: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {metrics.map((metric) => {
        const MainIcon = metric.Icon;

        return (
          <div
            key={metric.title}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-slate-500">
                {metric.title}
              </span>
              <MainIcon className={`h-5 w-5 ${metric.iconColor}`} />
            </div>

            <div className="mt-4">
              <span className="text-2xl font-bold tracking-tight text-slate-950">
                {metric.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
