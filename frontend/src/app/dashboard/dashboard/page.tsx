// src/app/dashboard/dashboard/page.tsx
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

export default function RegularUserDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/sign-in');
        return;
      }

      if (user.role !== UserRole.REGULAR_USER) {
        // Redirect to appropriate dashboard instead of showing error
        const redirectTo = getDefaultDashboard(user.role);
        console.log(`Redirecting ${user.role} from regular user dashboard to ${redirectTo}`);
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

  if (user.role !== UserRole.REGULAR_USER) {
    // Show loading while redirecting
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.displayName}!</h1>
        <p className="text-muted-foreground">
          Track your fitness journey and achieve your goals.
        </p>
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
