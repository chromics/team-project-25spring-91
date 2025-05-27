// src/components/auth/role-guard.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/components/auth/sign-up-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackRoute?: string;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackRoute 
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!loading && !hasChecked) {
      setHasChecked(true);
      
      if (!user) {
        router.push('/sign-in');
        return;
      }

      const hasPermission = allowedRoles.includes(user.role);
      
      if (!hasPermission) {
        const redirectRoute = fallbackRoute || getDefaultDashboard(user.role);
        console.log(`User role ${user.role} not allowed. Redirecting to ${redirectRoute}`);
        router.push(redirectRoute);
        return;
      }
    }
  }, [user, loading, allowedRoles, fallbackRoute, router, hasChecked]);

  if (loading || !hasChecked) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoadingSpinner />;
  }

  const hasPermission = allowedRoles.includes(user.role);

  if (!hasPermission) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}

function getDefaultDashboard(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "/dashboard/admin/dashboard";
    case UserRole.GYM_OWNER:
      return "/dashboard/gym-owner/dashboard";
    case UserRole.REGULAR_USER:
    default:
      return "/dashboard/dashboard";
  }
}
