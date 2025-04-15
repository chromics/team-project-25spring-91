"use client"

import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const chartData = [
  { year: 2021, month: "January", desktop: 221, mobile: 171 },
  { year: 2021, month: "September", desktop: 209, mobile: 164 },
  { year: 2023, month: "April", desktop: 211, mobile: 138 },
  { year: 2023, month: "June", desktop: 231, mobile: 151 },
  { year: 2024, month: "January", desktop: 186, mobile: 80 },
  { year: 2024, month: "February", desktop: 305, mobile: 200 },
  { year: 2024, month: "March", desktop: 237, mobile: 120 },
  { year: 2024, month: "April", desktop: 73, mobile: 190 },
  { year: 2024, month: "May", desktop: 209, mobile: 130 },
  { year: 2024, month: "June", desktop: 214, mobile: 140 }
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
};

const ALL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AnnualBarChart() {
  const years = React.useMemo(() => {
    const uniqueYears = new Set(chartData.map(item => item.year));
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, []);

  const [selectedYear, setSelectedYear] = React.useState(years[0].toString());

  const completeData = React.useMemo(() => {
    return ALL_MONTHS.map(month => {
      const existingData = chartData.find(
        item => item.year.toString() === selectedYear && item.month === month
      );
      return {
        year: parseInt(selectedYear),
        month,
        desktop: existingData?.desktop ?? 0,
        mobile: existingData?.mobile ?? 0
      };
    });
  }, [selectedYear]);

  return (
    <div className="mx-auto">
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Total Workout Completed Per Month</CardTitle>
            <CardDescription>
              Status: ¯\_(ツ)_/¯
            </CardDescription>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label="Select a year">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {years.map(year => (
                <SelectItem key={year} value={year.toString()} className="rounded-lg">
                  Year {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <BarChart data={completeData}>
              <defs>
                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8}
                interval={0}
                height={60}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => value}
                    indicator="dot"
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}