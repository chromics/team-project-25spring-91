// src/app/dashboard/gym-owner/dashboard/page.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/components/auth/sign-up-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading";

const getDefaultDashboard = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '/dashboard/admin/dashboard';
    case UserRole.GYM_OWNER:
      return '/dashboard/gym-owner/dashboard';
    case UserRole.REGULAR_USER:
    default:
      return '/dashboard/dashboard';
  }
};

export default function GymOwnerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/sign-in');
        return;
      }

      if (user.role !== UserRole.GYM_OWNER) {
        // Redirect to appropriate dashboard instead of showing error
        const redirectTo = getDefaultDashboard(user.role);
        console.log(`Redirecting ${user.role} from gym-owner dashboard to ${redirectTo}`);
        router.push(redirectTo);
        return;
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoadingSpinner />;
  }

  if (user.role !== UserRole.GYM_OWNER) {
    // Show loading while redirecting
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gym Owner Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome {user.displayName}! Manage your gyms and bookings from here.
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
