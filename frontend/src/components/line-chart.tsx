"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Month = "January" | "February" | "March" | "April" | "May" | "June" | 
  "July" | "August" | "September" | "October" | "November" | "December";

type ChartDataItem = {
  year: number;
  month: Month;
  desktop: number;
  mobile: number;
  label?: string;
}

const chartData: ChartDataItem[] = [
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

// Sort data chronologically
const sortedChartData = [...chartData].sort((a, b) => {
  const monthOrder: Record<Month, number> = {
    "January": 0, "February": 1, "March": 2, "April": 3, 
    "May": 4, "June": 5, "July": 6, "August": 7, 
    "September": 8, "October": 9, "November": 10, "December": 11
  };
  
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  return monthOrder[a.month] - monthOrder[b.month];
});

// Add labels for each data point
const processedChartData = sortedChartData.map(item => ({
  ...item,
  label: `${item.month} ${item.year}`
}));

const chartConfig = {
  views: {
    label: "Page Views",
  },
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function Component() {
  const [activeChart, setActiveChart] = 
    React.useState<keyof typeof chartConfig>("desktop");
  const [timeRange, setTimeRange] = React.useState("all");

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const filteredData = React.useMemo(() => {
    if (timeRange === "all") {
      return processedChartData;
    }
    
    const yearsToInclude = timeRange === "past-year" ? 1 : 2;
    
    return processedChartData.filter(item => {
      const itemDate = new Date(item.year, getMonthIndex(item.month));
      const cutoffDate = new Date(currentYear, currentMonth);
      cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsToInclude);
      
      return itemDate >= cutoffDate;
    });
  }, [timeRange]);

  const total = React.useMemo(
    () => ({
      desktop: filteredData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: filteredData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    [filteredData]
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <CardTitle>Total Workout Volume Per Month</CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="past-year">Past Year</SelectItem>
                <SelectItem value="past-2-years">Past 2 Years</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>
            Shows the total workout volume per month {timeRange === "all" ? "for all time" : 
              timeRange === "past-year" ? "for the past year" : "for the past 2 years"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={filteredData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const [month, year] = value.split(' ');
                return `${month.slice(0, 3)} ${year}`;
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => value}
                />
              }
            />
            <Line
              dataKey="desktop"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Helper function to convert month name to index
function getMonthIndex(monthName: Month): number {
  const months: Record<Month, number> = {
    "January": 0, "February": 1, "March": 2, "April": 3, 
    "May": 4, "June": 5, "July": 6, "August": 7, 
    "September": 8, "October": 9, "November": 10, "December": 11
  };
  return months[monthName];
}