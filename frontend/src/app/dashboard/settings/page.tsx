"use client";

import { UserRole } from '@/components/auth/sign-up-form';
import ButterflyLoader from '@/components/butterfly-loader';
import { useRoleProtection } from '@/hooks/use-role-protection';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import api from "@/lib/api";
import axios from "axios";

import { PersonalInformationSection } from "@/components/settings/personal-information";
import { AccountInformationSection } from "@/components/settings/account-information";

interface UserProfileData {
  id: number;
  email: string;
  displayName: string;
  dateOfBirth: string | null;
  gender: string | null;
  heightCm: number | null;
  weightKg: number | string | null;
  createdAt: string;
  role: string;
  imageUrl: string | null;
}

interface UserSettings {
  id: number;
  email: string;
  displayName: string;
  dateOfBirth: Date | null;
  gender: string;
  heightCm: number | string;
  weightKg: number | string;
  createdAt: string;
  role: string;
  imageUrl: string | null;
}

export default function SettingsPage() {
  const { isAuthorized, isLoading: isRoleLoading, user } = useRoleProtection({
    allowedRoles: [UserRole.REGULAR_USER, UserRole.ADMIN, UserRole.GYM_OWNER],
  });

  const [settings, setSettings] = useState<UserSettings>({
    id: 0,
    email: "",
    displayName: "",
    dateOfBirth: null,
    gender: "",
    heightCm: "",
    weightKg: "",
    createdAt: "",
    role: "",
    imageUrl: null,
  });

  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!isAuthorized || isRoleLoading) {
        if (!isRoleLoading && !isAuthorized) {
          setIsLoadingSettings(false);
        }
        return;
      }

      setIsLoadingSettings(true);
      try {
        const response = await api.get<{
          status: string;
          data: UserProfileData;
          message?: string;
        }>("/users/profile");

        if (response.data.status === "success" && response.data.data) {
          const userData = response.data.data;
          setSettings({
            id: userData.id,
            email: userData.email,
            displayName: userData.displayName,
            dateOfBirth: userData.dateOfBirth
              ? new Date(userData.dateOfBirth)
              : null,
            gender: userData.gender || "",
            heightCm: userData.heightCm ?? "",
            weightKg: userData.weightKg ?? "",
            createdAt: userData.createdAt,
            role: userData.role,
            imageUrl: userData.imageUrl,
          });
        } else {
          throw new Error(
            response.data.message || "Failed to load user profile data.",
          );
        }
      } catch (error) {
        let errorMessage = "Failed to fetch user settings";
        if (
          axios.isAxiosError(error) &&
          error.response?.data?.message
        ) {
          errorMessage = error.response.data.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
        console.error("Failed to fetch user settings:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchUserSettings();
  }, [isAuthorized, isRoleLoading]);

  const handleInputChange = (
    field: keyof UserSettings,
    value: string | Date | null | number,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (newImageUrl: string | null) => {
    setSettings((prev) => ({
      ...prev,
      imageUrl: newImageUrl,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Prepare data for the PUT request
      const updateData: Partial<UserProfileData> = {
        email: settings.email,
        displayName: settings.displayName,
        dateOfBirth: settings.dateOfBirth
          ? format(settings.dateOfBirth, "yyyy-MM-dd")
          : null,
        gender: settings.gender || null,
        heightCm: settings.heightCm ? Number(settings.heightCm) : null,
        weightKg: settings.weightKg ? Number(settings.weightKg) : null,
        imageUrl: settings.imageUrl,
      };

      const response = await api.put<{
        status: string;
        message?: string;
        data?: UserProfileData;
      }>("/users/profile", updateData);

      if (response.data.status === "success") {
        toast.success("Settings updated successfully!");
        if (response.data.data) {
          const updatedUserData = response.data.data;
          setSettings((prev) => ({
            ...prev,
            email: updatedUserData.email,
            displayName: updatedUserData.displayName,
            dateOfBirth: updatedUserData.dateOfBirth
              ? new Date(updatedUserData.dateOfBirth)
              : null,
            gender: updatedUserData.gender || "",
            heightCm: updatedUserData.heightCm ?? "",
            weightKg: updatedUserData.weightKg ?? "",
            imageUrl: updatedUserData.imageUrl,
          }));
        }
      } else {
        throw new Error(response.data.message || "Failed to update settings");
      }
    } catch (error) {
      let errorMessage = "Failed to save settings";
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.message
      ) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isRoleLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[200px] text-center">
        <p className="text-xl text-destructive">Access Denied</p>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Welcome {user?.displayName || settings.displayName || "User"}!
            Manage your account settings and personal information here.
          </p>
        </div>

        <div className="space-y-8">
          <PersonalInformationSection
            settings={settings}
            onInputChange={handleInputChange}
            onImageChange={handleImageChange}
            userDisplayNameForAvatar={
              settings.displayName || user?.displayName || ""
            }
          />

          <AccountInformationSection
            settings={settings}
            onInputChange={
              handleInputChange as (field: "email", value: string) => void
            }
          />

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoadingSettings}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}