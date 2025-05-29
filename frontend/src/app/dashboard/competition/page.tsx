'use client';

import { CompetitionsPage } from "@/components/competitions/CompetitionsPage";
import ButterflyLoader from '@/components/butterfly-loader';
import { useRoleProtection } from '@/hooks/use-role-protection'
import { UserRole } from '@/components/auth/sign-up-form';

export default function CompetitionsPageRoute() {
    const { isAuthorized, isLoading, user } = useRoleProtection({
      allowedRoles: [UserRole.REGULAR_USER]
    });
    
    return <CompetitionsPage />;
  
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
}