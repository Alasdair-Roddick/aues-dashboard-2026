"use client";

import { useRef, useEffect } from "react";
import Chart from "chart.js/auto";
import { useMembersStore } from "@/app/store/membersStore";
import { Skeleton } from "@/components/ui/skeleton";

export function MemberChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const membersLoading = useMembersStore((state) => state.membersLoading);
  const getMembersByMonth = useMembersStore((state) => state.getMembersByMonth);

  // Get monthly data from store
  const monthlyData = getMembersByMonth(6);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy previous chart instance
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const labels = monthlyData.map((d) => d.month);
    const counts = monthlyData.map((d) => d.count);

    console.log("Chart labels:", labels);
    console.log("Chart counts:", counts);

    // Get the computed primary color value
    const tempDiv = document.createElement('div');
    tempDiv.style.color = `hsl(var(--primary))`;
    document.body.appendChild(tempDiv);
    const computedColor = getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);

    // Convert RGB to RGBA with alpha channel
    const primaryColorWithAlpha = (alpha: number) => {
      return computedColor.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    };

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "New Members",
            data: counts,
            fill: true,
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 256);
              gradient.addColorStop(0, primaryColorWithAlpha(0.3));
              gradient.addColorStop(1, primaryColorWithAlpha(0));
              return gradient;
            },
            borderColor: computedColor,
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: computedColor,
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointHoverBackgroundColor: computedColor,
            pointHoverBorderColor: "#fff",
            pointHoverBorderWidth: 3,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (tooltipItems) => {
                return tooltipItems[0].label;
              },
              label: (context) => {
                const value = context.parsed.y;
                return `${value} new ${value === 1 ? 'member' : 'members'}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#6b7280",
              font: {
                size: 11,
                weight: 500,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(107, 114, 128, 0.1)",
            },
            border: {
              display: false,
            },
            ticks: {
              color: "#6b7280",
              stepSize: 1,
              font: {
                size: 11,
                weight: 500,
              },
              padding: 8,
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [monthlyData]);

  if (membersLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div style={{ height: "256px", width: "100%", position: "relative" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
