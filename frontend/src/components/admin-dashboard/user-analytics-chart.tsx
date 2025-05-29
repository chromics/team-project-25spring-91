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
} from "recharts";

interface MonthlyUserData {
  month: string;
  users: number;
}

export function UserAnalyticsChart() {
  const [data, setData] = useState<MonthlyUserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch("/api/admin/user-analytics");
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error("Failed to fetch user analytics:", error);
        // Mock data for development - last 12 months
        const mockData: MonthlyUserData[] = [];
        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        for (let i = 0; i < 12; i++) {
          const monthIndex = (new Date().getMonth() - 11 + i + 12) % 12;
          mockData.push({
            month: months[monthIndex],
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
        <h3 className="text-lg font-semibold">Total Number of Users Per Month</h3>
        <p className="text-sm text-muted-foreground">
          User registration trends over the past 12 months
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              className="text-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              className="text-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                color: "#374151",
                fontSize: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
              labelStyle={{
                color: "#374151",
                fontSize: "12px",
                fontWeight: "500"
              }}
              itemStyle={{
                color: "#374151",
                fontSize: "12px"
              }}
            />
            <Bar
              dataKey="users"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="Total Users"
              style={{ filter: "none" }}
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
