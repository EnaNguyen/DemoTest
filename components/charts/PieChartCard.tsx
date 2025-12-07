"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

interface PieChartCardProps {
  title: string;
  description?: string;
  data: PieDataItem[];
  unit?: string;
}

export function PieChartCard({
  title,
  description,
  data,
  unit = "khách sạn",
}: PieChartCardProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Tạo config để legend hiện tên
  const chartConfig = data.reduce((acc, item, i) => {
    acc[item.name] = { label: item.name };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value: number) => `${value} ${unit}`}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
            >
              {/* BÍ KÍP Ở ĐÂY: DÙNG CELL + FILL MÀU TÙY Ý */}
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">Tổng cộng</p>
          <p className="text-3xl font-bold text-primary">
            {total} <span className="text-lg font-normal text-muted-foreground">{unit}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}