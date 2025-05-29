"use client";

import { useEffect, useState } from "react";
import { useRoleProtection } from "@/hooks/use-role-protection";
import { UserRole } from "@/components/auth/sign-up-form";
import ButterflyLoader from "@/components/butterfly-loader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import GymOwnerCard from "@/components/gym/admin-gym-card";
import { useRouter } from "next/navigation";
import { Gym } from "@/types/gym";
import api from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";

export default function GymOwnerDashboard() {
  const router = useRouter();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthorized, isLoading, user } = useRoleProtection({
    allowedRoles: [UserRole.GYM_OWNER]
  });

  useEffect(() => {
    const fetchMyGyms = async () => {
      try {

        const response = await api.get('/gyms/owned/my-gyms');

        let gymData = response.data.data || response.data;

        // Filter gyms by current user if not admin
        if (user?.role !== UserRole.ADMIN && user?.id) {
          gymData = gymData.filter((gym: any) => gym.ownerId === user.id);
        }

        const formattedGyms = gymData.map((gym: Gym) => ({
          id: gym.id,
          name: gym.name,
          address: gym.address,
          description: gym.description,
          contactInfo: gym.contactInfo,
          imageUrl: gym.imageUrl,
          ownerId: gym.ownerId,
          createdAt: gym.createdAt,
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
  if (isLoading || !isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full px-4 py-[35px]">
      <div className="space-y-6 max-w-6xl w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gym Owner Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome {user?.displayName}! Manage your gyms and bookings from here.
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


        {/* owner gym  */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">My Gyms</h1>
              <p className="text-muted-foreground">
                Manage your gym locations and settings
              </p>
            </div>
            <Button
              onClick={() => router.push('/dashboard/gym-submission-form')}
              className="flex items-center gap-2 cursor-pointer"
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
                <GymOwnerCard key={gym.id} gym={gym} />
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

      </div>
    </div>
  );
}
