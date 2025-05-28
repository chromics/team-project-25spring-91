'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Gym } from '@/types/gym';
import GymCard from '@/components/gym/gym-card';
import ButterflyLoader from '@/components/butterfly-loader';
import api from '@/lib/api';
import axios from 'axios';
import { toast } from 'sonner';
import { useRoleProtection } from '@/hooks/use-role-protection';
import { UserRole } from '@/components/auth/sign-up-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function MyGymsPage() {
  const router = useRouter();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);

  const { isAuthorized, isLoading, user } = useRoleProtection({
    allowedRoles: [UserRole.ADMIN, UserRole.GYM_OWNER]
  });

  useEffect(() => {
    const fetchMyGyms = async () => {
      try {
        // TODO: change this endpoint to get my gym 
        const response = await api.get('/gyms');

        let gymData = response.data.data || response.data;
        
        // Filter gyms by current user if not admin
        if (user?.role !== UserRole.ADMIN && user?.id) {
          gymData = gymData.filter((gym: any) => gym.ownerId === user.id);
        }

        const formattedGyms = gymData.map((gym: any) => ({
          id: gym.id,
          name: gym.name,
          address: gym.address,
          description: gym.description,
          contactInfo: gym.contactInfo,
          imageUrl: gym.imageUrl,
          ownerId: gym.ownerId,
          createdAt: gym.createdAt,
          _count: gym._count,
        }));
        
        setGyms(formattedGyms);

      } catch (error: unknown) {
        console.error("Error details:", error);

        let errorMessage = "Failed to load gyms";

        if (axios.isAxiosError(error) && error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthorized && user) {
      fetchMyGyms();
    }
  }, [isAuthorized, user]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  // Main return for loaded content
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Gyms</h1>
          <p className="text-muted-foreground">
            Manage your gym locations and settings
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/create-gym')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Gym
        </Button>
      </div>

      {/* Gyms Grid */}
      <div className="
        grid
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-5
        xl:grid-cols-6
        gap-7
        [grid-template-columns:repeat(auto-fit,minmax(10rem,1fr))]
        max-w-full
        animate-fade-in
      ">
        {gyms.length > 0 ? (
          gyms.map((gym) => (
            <GymCard key={gym.id} gym={gym} />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <h3 className="text-lg font-medium">No gyms found</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              You haven't created any gyms yet. Start by creating your first gym!
            </p>
            <Button 
              onClick={() => router.push('/dashboard/create-gym')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Your First Gym
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
