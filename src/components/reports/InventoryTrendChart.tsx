"use client";

import { useMemo } from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";

import type { InventoryTrend } from "@/types/report";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
);

interface InventoryTrendChartProps {
  trends: InventoryTrend[];
}

export function InventoryTrendChart({
  trends,
}: InventoryTrendChartProps) {
  const data = useMemo(
    () => ({
      labels: trends.map((item) => item.label),

      datasets: [
        {
          label: "Stok Masuk",
          data: trends.map((item) => item.stockIn),
          backgroundColor: "#60a5fa",
          hoverBackgroundColor: "#3b82f6",
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 36,
        },
        {
          label: "Stok Keluar",
          data: trends.map((item) => item.stockOut),
          backgroundColor: "#22c55e",
          hoverBackgroundColor: "#16a34a",
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 36,
        },
      ],
    }),
    [trends],
  );

  const options = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,

      maintainAspectRatio: false,

      interaction: {
        mode: "index",
        intersect: false,
      },

      plugins: {
        legend: {
          position: "bottom",

          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 16,
            boxWidth: 8,
            boxHeight: 8,
            font: {
              size: 11,
              family: "Inter",
            },
            color: "#475569",
          },
        },

        tooltip: {
          backgroundColor: "#ffffff",
          titleColor: "#64748b",
          bodyColor: "#0f172a",
          borderColor: "#e2e8f0",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          displayColors: true,

          titleFont: {
            size: 12,
            weight: "bold",
          },

          bodyFont: {
            size: 12,
          },

          callbacks: {
            label(context) {
              const value = Number(context.raw ?? 0);

              return `${context.dataset.label}: ${value.toLocaleString(
                "id-ID",
              )} unit`;
            },
          },
        },
      },

      scales: {
        x: {
          grid: {
            display: false,
          },

          border: {
            display: false,
          },

          ticks: {
            color: "#94a3b8",

            font: {
              size: 10,
              family: "Inter",
            },

            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8,
          },
        },

        y: {
          beginAtZero: true,

          border: {
            display: false,
          },

          grid: {
            color: "#f1f5f9",
            drawTicks: false,
          },

          ticks: {
            color: "#94a3b8",
            padding: 8,

            font: {
              size: 10,
              family: "Inter",
            },

            callback(value) {
              return Number(value).toLocaleString("id-ID");
            },
          },
        },
      },
    }),
    [],
  );

  return (
    <div className="relative h-[240px] w-full min-w-0 sm:h-[280px] md:h-[320px]">
      <Bar data={data} options={options} />
    </div>
  );
}