"use client";

import { useEffect, useRef } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarDataItem {
    name: string;
    value: number;
    color?: string;
}

interface BarChartCardProps {
    title: string;
    description?: string;
    data: BarDataItem[];
    unit?: string;
}

const defaultColors = [
    "hsl(220, 90%, 56%)",
    "hsl(142, 71%, 45%)",
    "hsl(38, 92%, 50%)",
    "hsl(4, 90%, 58%)",
    "hsl(262, 83%, 58%)",
    "hsl(333, 71%, 51%)",
];

export function BarChartCard({
    title,
    description,
    data,
    unit = "khách sạn",
}: BarChartCardProps) {
    const chartRef = useRef<ChartJS<"bar">>(null);
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const total = sortedData.reduce((sum, item) => sum + item.value, 0);

    const chartData = {
        labels: sortedData.map((item) => item.name),
        datasets: [
            {
                label: unit,
                data: sortedData.map((item) => item.value),
                backgroundColor: sortedData.map(
                    (item, index) =>
                        item.color || defaultColors[index % defaultColors.length]
                ),
                borderRadius: 0,
                maxBarThickness: 80,
                barThickness: 60,
            },
        ],
    };

    const options: ChartOptions<"bar"> = {
        indexAxis: "x" as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                mode: 'nearest',           
                intersect: true,        
                position: 'nearest', 
                caretPadding: 10,
                callbacks: {
                    title: (context) => context[0].label,
                    label: (context) => {
                        const value = context.parsed.y;
                        if (typeof value !== 'number') return '';
                        return `Số lượng: ${value.toLocaleString()} ${context.label || ''}`;
                    },
                },
                backgroundColor: "rgba(15, 23, 42, 0.98)",
                titleColor: "#60a5fa",
                bodyColor: "#e0f2fe",
                titleFont: { size: 15, weight: "bold" },
                bodyFont: { size: 18, weight: "bold" },
                padding: { x: 16, y: 10 },
                cornerRadius: 12,
                displayColors: false,
                borderColor: "#3b82f6",
                borderWidth: 2,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: "#6b7280",
                    font: { size: 11 },
                    maxRotation: 45,
                    minRotation: 0,
                    autoSkip: false,
                    callback: function (value) {
                        const label = this.getLabelForValue(value as number);
                        if (typeof label !== "string") return label;
                        return label.length > 15 ? label.substring(0, 15) + "..." : label;
                    },
                },
                border: { display: false },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                    drawTicks: false,
                },
                ticks: {
                    color: "#6b7280",
                    font: { size: 12 },
                    callback: (value) => (Number.isInteger(value) ? value : ""),
                },
                border: { display: false },
            },
        },
    };

    useEffect(() => {
        const chartInstance = chartRef.current;
        return () => {
            chartInstance?.destroy();
        };
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                {sortedData.length === 0 ? (
                    <div className="flex h-96 items-center justify-center text-muted-foreground">
                        Chưa có dữ liệu
                    </div>
                ) : (
                    <>
                        <div className="h-96 w-full">
                            <Bar ref={chartRef} data={chartData} options={options} />
                        </div>

                        <div className="mt-6 pt-4 border-t text-center">
                            <p className="text-sm text-muted-foreground">Tổng cộng</p>
                            <p className="text-3xl font-bold text-primary">
                                {total.toLocaleString()} {unit}
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
