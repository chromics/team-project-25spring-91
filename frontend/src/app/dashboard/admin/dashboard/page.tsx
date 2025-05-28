// src/app/dashboard/admin/dashboard/page.tsx
"use client";

import { useRoleProtection } from "@/hooks/use-role-protection";
import { UserRole } from "@/components/auth/sign-up-form";
import { LoadingSpinner } from "@/components/ui/loading";
import ButterflyLoader from "@/components/butterfly-loader";

export default function AdminDashboard() {
  const { isAuthorized, isLoading, user } = useRoleProtection({
    allowedRoles: [UserRole.ADMIN]
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome {user?.displayName}! Manage your application from here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Total Users</h3>
          <p className="text-2xl font-bold">1,234</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Total Gyms</h3>
          <p className="text-2xl font-bold">56</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Pending Approvals</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Active Bookings</h3>
          <p className="text-2xl font-bold">789</p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
        <div className="space-y-2">
          <p>• Approve or reject gym submissions</p>
          <p>• Manage user accounts</p>
          <p>• View system analytics</p>
          <p>• Configure application settings</p>
        </div>
      </div>
    </div>
  );
}
