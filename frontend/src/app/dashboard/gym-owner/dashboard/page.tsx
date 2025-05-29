"use client";

import { useState } from "react";
import { useRoleProtection } from "@/hooks/use-role-protection";
import { UserRole } from "@/components/auth/sign-up-form";
import ButterflyLoader from "@/components/butterfly-loader";

export default function GymOwnerDashboard() {
  const { isAuthorized, isLoading, user } = useRoleProtection({
    allowedRoles: [UserRole.GYM_OWNER]
  });

  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
  const [selectedGymName, setSelectedGymName] = useState<string>("");

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full px-4 py-[35px]">
      <div className="space-y-6 max-w-4xl w-full">
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

        {/* Manage Gyms Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-2">Manage Gyms</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2 pt-2">
            {[1, 2, 3, 4, 5, 6].map((id) => {
              const gymName = `Gym ${id}`;
              return (
                <div
                  key={id}
                  className="min-w-[200px] h-32 bg-muted rounded-lg flex flex-col items-center justify-center text-sm text-muted-foreground p-2"
                >
                  {gymName}
                  <button
                    className="mt-2 text-xs text-blue-600 underline"
                    onClick={() => {
                      setSelectedGymId(`gym-${id}`);
                      setSelectedGymName(gymName);
                    }}
                  >
                    Show Details
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expanded Gym Edit Section */}
        {selectedGymId && (
          <div className="p-6 border rounded-lg bg-background text-foreground space-y-6">
            <h3 className="text-xl font-semibold">Edit {selectedGymName}</h3>

            {/* Manage Memberships */}
            <div>
              <h4 className="text-lg font-medium mb-1">Manage Memberships</h4>
              <p className="text-sm text-muted-foreground">
                There are currently no memberships.
              </p>
            </div>

            {/* Manage Classes */}
            <div>
              <h4 className="text-lg font-medium mb-1">Manage Classes</h4>
              <p className="text-sm text-muted-foreground">
                There are currently no classes.
              </p>
            </div>

            {/* Manage Competitions */}
            <div>
              <h4 className="text-lg font-medium mb-1">Manage Competitions</h4>
              <p className="text-sm text-muted-foreground">
                There are currently no competitions.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                Save Updates
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
                onClick={() => setSelectedGymId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
