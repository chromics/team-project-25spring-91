"use client";

import { useRoleProtection } from "@/hooks/use-role-protection";
import { UserRole } from "@/components/auth/sign-up-form";
import ButterflyLoader from "@/components/butterfly-loader";
import { AdminStatsCard } from "@/components/admin-dashboard/admin-stats-card";
import { UserAnalyticsChart } from "@/components/admin-dashboard/user-analytics-chart";
import { ViewUsersTable } from "@/components/admin-dashboard/view-users-table";

export default function AdminDashboard() {
  const { isAuthorized, isLoading, user } = useRoleProtection({
    allowedRoles: [UserRole.ADMIN],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome {user?.displayName}! Manage your application from here.
          </p>
        </div>

        {/* Analytics Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Analytics</h2>

          {/* Stats Cards */}
          <AdminStatsCard />

          {/* User Analytics Chart */}
          <UserAnalyticsChart />
        </div>

        {/* User Management Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">User Management</h2>
          <ViewUsersTable />
        </div>
      </div>
    </div>
  );
}
