// src/hooks/use-role-protection.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/components/auth/sign-up-form";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export const getDefaultDashboard = (role: UserRole): string => {
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
  const hasCheckedRef = useRef(false);


  useEffect(() => {


    if (!loading && !hasCheckedRef.current) {
      hasCheckedRef.current = true;
      if (!user) {
        router.push('/sign-in');
        return;
      }



      // return true if the user role exists in allowedRoles that paste from the page components 
      const hasPermission = allowedRoles.includes(user.role);
      
      if (!hasPermission) {
        const redirectRoute = redirectTo || getDefaultDashboard(user.role);
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
