// src/hooks/use-role-protection.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/components/auth/sign-up-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

interface UseRoleProtectionProps {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function useRoleProtection({ allowedRoles, redirectTo }: UseRoleProtectionProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/sign-in');
        return;
      }

      const hasPermission = allowedRoles.includes(user.role);
      
      if (!hasPermission) {
        const redirectRoute = redirectTo || getDefaultDashboard(user.role);
        console.log(`Redirecting ${user.role} to ${redirectRoute} - not authorized for this page`);
        router.push(redirectRoute);
        return;
      }

      setIsAuthorized(true);
      setIsChecking(false);
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  return {
    isAuthorized,
    isLoading: loading || isChecking,
    user
  };
}
