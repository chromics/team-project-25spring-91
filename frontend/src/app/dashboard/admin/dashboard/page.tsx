// src/app/dashboard/admin/dashboard/page.tsx
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

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/sign-in');
        return;
      }

      if (user.role !== UserRole.ADMIN) {
        // Redirect to appropriate dashboard instead of showing error
        const redirectTo = getDefaultDashboard(user.role);
        console.log(`Redirecting ${user.role} from admin dashboard to ${redirectTo}`);
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

  if (user.role !== UserRole.ADMIN) {
    // Show loading while redirecting
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome {user.displayName}! Manage your application from here.
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
