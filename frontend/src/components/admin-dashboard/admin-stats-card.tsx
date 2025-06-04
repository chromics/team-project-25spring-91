"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import api from "@/lib/api";

interface AdminStats {
  totalGyms: number;
  totalRegularUsers: number;
  totalGymOwners: number;
}

export function AdminStatsCard() {
  const [stats, setStats] = useState<AdminStats>({
    totalGyms: 0,
    totalRegularUsers: 0,
    totalGymOwners: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setIsLoading(true);
      try {
        const [gymsResponse, userCountsResponse] = await Promise.all([
          api.get("/gyms/statistics/total-count"),
          api.get("/users/admin/statistics/counts"),
        ]);

        if (
          gymsResponse.data.status !== "success" ||
          userCountsResponse.data.status !== "success"
        ) {
          let errorMessage = "API responses indicated failure.";
          if (gymsResponse.data.status !== "success") {
            errorMessage += ` Gyms API: ${gymsResponse.data.message || "Failed"}.`;
          }
          if (userCountsResponse.data.status !== "success") {
            errorMessage += ` User Counts API: ${userCountsResponse.data.message || "Failed"}.`;
          }
          throw new Error(errorMessage);
        }

        setStats({
          totalGyms: gymsResponse.data.data.totalGyms,
          totalRegularUsers: userCountsResponse.data.data.totalRegularUsers,
          totalGymOwners: userCountsResponse.data.data.totalGymOwners,
        });
      } catch (error) {
        let errorMessage = "Failed to load admin statistics";
        if (axios.isAxiosError(error) && error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (isLoading) {
    return (
      <div className="border-2 border-primary/20 bg-card p-4 sm:p-8 rounded-xl w-full max-w-5xl mx-auto">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return <StatDisplay stats={stats} />;
}

function StatDisplay({ stats }: { stats: AdminStats }) {
  return (
    <div className="border-2 border-primary/20 bg-card p-4 sm:p-8 rounded-xl w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-around items-center gap-6 sm:gap-0">
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <div className="text-2xl sm:text-3xl font-bold text-primary">
            {stats.totalGyms}
          </div>
          <div className="text-sm text-muted-foreground italic">Total Gyms</div>
        </div>
        <div className="hidden sm:block h-20 w-px bg-border"></div>
        <div className="w-1/2 h-px bg-border sm:hidden"></div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <div className="text-2xl sm:text-3xl font-bold text-primary">
            {stats.totalRegularUsers}
          </div>
          <div className="text-sm text-muted-foreground italic">Total Users</div>
        </div>
        <div className="hidden sm:block h-20 w-px bg-border"></div>
        <div className="w-1/2 h-px bg-border sm:hidden"></div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <div className="text-2xl sm:text-3xl font-bold text-primary">
            {stats.totalGymOwners}
          </div>
          <div className="text-sm text-muted-foreground italic">
            Total Gym Owners
          </div>
        </div>
      </div>
    </div>
  );
}
