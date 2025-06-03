"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User as UserIcon, CheckCircle } from "lucide-react";

interface ProfileImageUrlInputProps {
  currentImageUrl: string | null;
  onImageUrlChange: (newImageUrl: string | null) => void;
  displayName?: string;
}

export function ProfileImageUploader({
  currentImageUrl,
  onImageUrlChange,
  displayName,
}: ProfileImageUrlInputProps) {
  const [inputUrl, setInputUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setInputUrl(currentImageUrl || "");
    setPreviewUrl(currentImageUrl);
  }, [currentImageUrl]);

  const handleUrlInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newUrl = event.target.value;
    setInputUrl(newUrl);
    if (newUrl && (newUrl.startsWith("http://") || newUrl.startsWith("https://"))) {
      setPreviewUrl(newUrl);
    } else if (!newUrl) {
      setPreviewUrl(null);
    }
  };

  const handleApplyUrl = () => {
    const trimmedUrl = inputUrl.trim();
    if (trimmedUrl && !(trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://"))) {
      toast.error("Please enter a valid image URL.");
      setPreviewUrl(currentImageUrl);
      return;
    }
    onImageUrlChange(trimmedUrl || null);
    setPreviewUrl(trimmedUrl || null);

    if (trimmedUrl) {
      toast.success("Image URL set. Save all settings to apply.");
    } else {
      toast.info("Image URL cleared. Save all settings to remove profile picture.");
    }
  };

  const getAvatarFallbackText = () => {
    if (displayName) {
      return displayName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return <UserIcon className="h-10 w-10" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Enter the URL of your desired profile picture.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Avatar on the left */}
          <Avatar className="h-24 w-24 flex-shrink-0 text-3xl sm:h-28 sm:w-28">
            <AvatarImage
              src={previewUrl || undefined}
              alt={displayName || "User Avatar"}
              onError={() => {
                if (previewUrl) {
                  toast.error("Could not load image from URL. Please check the link.");
                }
                setPreviewUrl(null);
              }}
            />
            <AvatarFallback>{getAvatarFallbackText()}</AvatarFallback>
          </Avatar>

          {/* URL Input and Button on the right */}
          <div className="flex w-full flex-col space-y-2 sm:ml-4">
            <Label htmlFor="imageUrlInput" className="sr-only">
              Image URL
            </Label>
            <Input
              id="imageUrlInput"
              type="url"
              placeholder="https://example.com/image.png"
              value={inputUrl}
              onChange={handleUrlInputChange}
              className="w-full"
            />
            <Button onClick={handleApplyUrl} className="w-full sm:w-auto">
              <CheckCircle className="mr-2 h-4 w-4" />
              Set Image URL
            </Button>
            <p className="pt-1 text-xs text-muted-foreground sm:text-left">
              Paste image address. Changes apply after saving all settings.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}