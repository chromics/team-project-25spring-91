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
import { format } from "date-fns";

interface UserSettings {
  email: string;
  role: string;
  createdAt: string;
}

interface AccountInformationSectionProps {
  settings: Pick<UserSettings, "email" | "role" | "createdAt">; // Use Pick for relevant fields
  onInputChange: (field: "email", value: string) => void;
}

export function AccountInformationSection({
  settings,
  onInputChange,
}: AccountInformationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>
          View and update your account credentials.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={settings.email}
              onChange={(e) => onInputChange("email", e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              This will be your new login email address.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              type="text"
              value={settings.role}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-sm text-muted-foreground">
              Your account role cannot be changed.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="createdAt">Account Created</Label>
          <Input
            id="createdAt"
            type="text"
            value={
              settings.createdAt
                ? format(new Date(settings.createdAt), "PPP")
                : "N/A"
            }
            disabled
            className="bg-muted cursor-not-allowed"
          />
        </div>
      </CardContent>
    </Card>
  );
}