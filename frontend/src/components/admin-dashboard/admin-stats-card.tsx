"use client";

import { useEffect, useState } from "react";

interface AdminStats {
  totalGyms: number;
  totalUsers: number;
  totalGymOwners: number;
}

export function AdminStatsCard() {
  const [stats, setStats] = useState<AdminStats>({
    totalGyms: 0,
    totalUsers: 0,
    totalGymOwners: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch("/api/admin/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
        // Mock data for development
        setStats({
          totalGyms: 100,
          totalUsers: 100,
          totalGymOwners: 100,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
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

  return (
    <div className="border-2 border-primary/20 bg-card p-4 sm:p-8 rounded-xl w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-around items-center gap-6 sm:gap-0">
        {/* Total Gyms */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <div className="text-2xl sm:text-3xl font-bold text-primary">
            {stats.totalGyms}
          </div>
          <div className="text-sm text-muted-foreground italic">Total Gyms</div>
        </div>

        {/* Vertical divider */}
        <div className="hidden sm:block h-20 w-px bg-border"></div>
        {/* Horizontal divider for mobile */}
        <div className="w-1/2 h-px bg-border sm:hidden"></div>

        {/* Total Users */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <div className="text-2xl sm:text-3xl font-bold text-primary">
            {stats.totalUsers}
          </div>
          <div className="text-sm text-muted-foreground italic">Total Users</div>
        </div>

        {/* Vertical divider */}
        <div className="hidden sm:block h-20 w-px bg-border"></div>
        {/* Horizontal divider for mobile */}
        <div className="w-1/2 h-px bg-border sm:hidden"></div>

        {/* Total Gym Owners */}
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
