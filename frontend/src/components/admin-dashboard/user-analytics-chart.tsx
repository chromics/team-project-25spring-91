"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { toast } from "sonner";
import axios from "axios";
import api from "@/lib/api";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

interface ApiMonthlyData {
  month: string;
  count: number;
}

interface ChartMonthlyData {
  month: string;
  users: number;
}

const formatMonthDisplay = (yearMonth: string): string => {
  try {
    const [year, month] = yearMonth.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString("default", { month: "short" });
  } catch (e) {
    console.error("Error formatting month:", yearMonth, e);
    return yearMonth;
  }
};

// Custom Tooltip Content Component
const CustomTooltipContent = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    const usersCount = dataPoint.payload?.users;

    if (typeof usersCount === "number" && usersCount === 0) {
      return null;
    }

    return (
      <div
        style={{
          backgroundColor: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "0.5rem",
          padding: "8px 12px",
          color: "hsl(var(--card-foreground))",
          fontSize: "12px",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      >
        <p
          style={{
            color: "hsl(var(--foreground))",
            fontSize: "12px",
            fontWeight: "500",
            marginBottom: "4px",
          }}
        >{`${label}`}</p>
        <p
          style={{ color: "hsl(var(--foreground))", fontSize: "12px" }}
        >{`${dataPoint.name}: ${dataPoint.value}`}</p>
      </div>
    );
  }
  return null;
};

export function UserAnalyticsChart() {
  const [data, setData] = useState<ChartMonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(
          "/users/admin/statistics/monthly-signups",
        );

        if (
          response.data.status !== "success" ||
          !Array.isArray(response.data.data)
        ) {
          throw new Error(
            response.data.message ||
              "API response indicated failure or malformed data.",
          );
        }

        const transformedData: ChartMonthlyData[] = response.data.data.map(
          (item: ApiMonthlyData) => ({
            month: formatMonthDisplay(item.month),
            users: item.count,
          }),
        );
        setData(transformedData);
      } catch (error) {
        let errorMessage = "Failed to load user analytics data";
        if (axios.isAxiosError(error) && error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
        console.error("Failed to fetch user analytics:", error);

        const mockData: ChartMonthlyData[] = [];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        const currentMonth = new Date().getMonth();
        for (let i = 0; i < 6; i++) {
          mockData.push({
            month: months[(currentMonth - 5 + i + 12) % 12],
            users: Math.floor(Math.random() * 50) + 10,
          });
        }
        setData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Monthly New User Signups</h3>
        <p className="text-sm text-muted-foreground">
          User registration trends based on available data.
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
            <XAxis
              dataKey="month"
              className="text-muted-foreground"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              className="text-muted-foreground"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltipContent />}
              cursor={false}
              wrapperStyle={{ zIndex: 1000 }}
            />
            <Bar
              dataKey="users"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="Users"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
