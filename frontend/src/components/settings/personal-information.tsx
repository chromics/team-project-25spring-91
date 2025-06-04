"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ProfileImageUploader } from "./profile-image-uploader";

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

interface PersonalInformationSectionProps {
  settings: UserSettings;
  onInputChange: (
    field: keyof UserSettings,
    value: string | Date | null | number,
  ) => void;
  onImageChange: (newImageUrl: string | null) => void;
  userDisplayNameForAvatar: string;
}

export function PersonalInformationSection({
  settings,
  onInputChange,
  onImageChange,
  userDisplayNameForAvatar,
}: PersonalInformationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your profile picture and personal details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Side-by-Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image Uploader - Left Side */}
          <div className="lg:col-span-1">
            <ProfileImageUploader
              currentImageUrl={settings.imageUrl}
              onImageChange={(newImageUrl, file) => {
                onInputChange("imageUrl", newImageUrl);
                setPendingImageFile(file);
              }}
              userDisplayNameForAvatar={userDisplayNameForAvatar}
            />
          </div>

          {/* Personal Details - Right Side */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="-"
                    value={settings.displayName}
                    onChange={(e) =>
                      onInputChange("displayName", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="heightCm">Height (cm)</Label>
                    <Input
                      id="heightCm"
                      type="number"
                      placeholder="-"
                      value={settings.heightCm}
                      onChange={(e) =>
                        onInputChange("heightCm", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weightKg">Weight (kg)</Label>
                    <Input
                      id="weightKg"
                      type="number"
                      placeholder="-"
                      value={settings.weightKg}
                      onChange={(e) =>
                        onInputChange("weightKg", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={settings.gender}
                      onValueChange={(value) => onInputChange("gender", value)}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="PreferNotToSay">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !settings.dateOfBirth && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {settings.dateOfBirth ? (
                            format(settings.dateOfBirth, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      {/* The PopoverContent width is w-auto by default, which is usually fine.
                          The issue is internal to the Calendar's caption rendering.
                          Adding a min-width here like min-w-[280px] or min-w-[300px]
                          might sometimes help if the calendar is being squeezed,
                          but it's unlikely to fix the specific text rendering issue ("Month: June").
                      */}
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={settings.dateOfBirth}
                          onSelect={(date) =>
                            onInputChange(
                              "dateOfBirth",
                              date === undefined ? null : date,
                            )
                          }
                          captionLayout="dropdown-buttons"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}