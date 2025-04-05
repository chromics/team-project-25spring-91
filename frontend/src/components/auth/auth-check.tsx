// src/components/auth/auth-check.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading";

interface AuthCheckProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthCheck({
  children,
  requireAuth = true,
  redirectTo = requireAuth ? "/sign-in" : "/dashboard",
}: AuthCheckProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const isAuthenticated = !!user;
      // console.log(user?.uid);
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
      } else if (!requireAuth && isAuthenticated) {
        router.push(redirectTo);
      }
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (
    (requireAuth && user) || // User is authenticated and auth is required
    (!requireAuth && !user) // User is not authenticated and auth is not required
  ) {
    return <>{children}</>;
  }

  return <LoadingSpinner />;
}