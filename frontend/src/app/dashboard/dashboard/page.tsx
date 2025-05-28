// src/app/dashboard/dashboard/page.tsx
"use client";

import { useRoleProtection } from "@/hooks/use-role-protection";
import { UserRole } from "@/components/auth/sign-up-form";
import { LoadingSpinner } from "@/components/ui/loading";

export default function RegularUserDashboard() {
  const { isAuthorized, isLoading, user } = useRoleProtection({
    allowedRoles: [UserRole.REGULAR_USER]
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthorized) {
    return <LoadingSpinner />;
  }

  console.log('Rendering dashboard content');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.displayName}!</h1>
        <p className="text-muted-foreground">
          Track your fitness journey and achieve your goals.
        </p>
        <p className="text-sm text-gray-500">User Role: {user?.role}</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Workouts This Week</h3>
          <p className="text-2xl font-bold">5</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Calories Burned</h3>
          <p className="text-2xl font-bold">2,340</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Goals Completed</h3>
          <p className="text-2xl font-bold">8/10</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Gym Visits</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="space-y-2">
          <p>• Log a new workout</p>
          <p>• Book a gym session</p>
          <p>• Update your goals</p>
          <p>• Check leaderboards</p>
        </div>
      </div>
    </div>
  );
}
