// src/app/dashboard/gym-owner/dashboard/page.tsx
"use client";

import { useRoleProtection } from "@/hooks/use-role-protection";
import { UserRole } from "@/components/auth/sign-up-form";
import { LoadingSpinner } from "@/components/ui/loading";

export default function GymOwnerDashboard() {
  const { isAuthorized, isLoading, user } = useRoleProtection({
    allowedRoles: [UserRole.GYM_OWNER]
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthorized) {
    return <LoadingSpinner />; // Will redirect automatically
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gym Owner Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome {user?.displayName}! Manage your gyms and bookings from here.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">My Gyms</h3>
          <p className="text-2xl font-bold">3</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Total Bookings</h3>
          <p className="text-2xl font-bold">45</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Revenue This Month</h3>
          <p className="text-2xl font-bold">$2,340</p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="space-y-2">
          <p>• Submit a new gym for approval</p>
          <p>• View your gym analytics</p>
          <p>• Manage gym schedules</p>
        </div>
      </div>
    </div>
  );
}
