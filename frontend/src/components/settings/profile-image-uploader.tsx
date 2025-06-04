"use client";

import { useState, ChangeEvent, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { User as UserIcon, Upload, X, Image as ImageIcon } from "lucide-react";

interface ProfileImageUploaderProps {
  currentImageUrl: string | null;
  onImageChange: (newImageUrl: string | null) => void; // This will be called with a data URL or null
  displayName?: string;
}

const MAX_FILENAME_LENGTH = 20; // Define a max length for the displayed filename

function truncateFilename(filename: string, maxLength: number): string {
  if (filename.length <= maxLength) {
    return filename;
  }
  const extensionMatch = filename.match(/\.[0-9a-z]+$/i);
  const extension = extensionMatch ? extensionMatch[0] : "";
  const nameWithoutExtension = extension
    ? filename.substring(0, filename.length - extension.length)
    : filename;

  if (nameWithoutExtension.length <= maxLength - 3 - extension.length) {
    return filename; // if even with extension it's short enough
  }

  const truncatedName = nameWithoutExtension.substring(
    0,
    maxLength - 3 - extension.length,
  );
  return `${truncatedName}...${extension}`;
}

export function ProfileImageUploader({
  currentImageUrl,
  onImageChange,
  displayName,
}: ProfileImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If there's a currentImageUrl (e.g., from the server), set it as the initial preview
    // This assumes currentImageUrl is a data URL or a publicly accessible URL if you still support that
    setPreviewUrl(currentImageUrl);
  }, [currentImageUrl]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (e.g., JPG, PNG, GIF).");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      onImageChange(result); // Pass the data URL to the parent
    };
    reader.readAsDataURL(file);

    toast.success(
      "Image selected. Save all settings to apply the new picture.",
    );
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onImageChange(null); // Notify parent that image is removed
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    toast.info(
      "Profile picture removed. Save all settings to apply changes.",
    );
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Upload a new profile picture or remove the current one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32 text-4xl">
            <AvatarImage
              src={previewUrl || undefined}
              alt={displayName || "User Avatar"}
              onError={() => {
                if (previewUrl && !currentImageUrl) {
                  // Only show error if it's a new upload failing, not an initial load
                  toast.error(
                    "Could not load the preview for the selected image.",
                  );
                }
                setPreviewUrl(null); // Fallback to no image or default
              }}
            />
            <AvatarFallback>{getAvatarFallbackText()}</AvatarFallback>
          </Avatar>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col gap-2 w-full max-w-xs">
            <Button onClick={handleUploadClick} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              {previewUrl || selectedFile ? "Change Picture" : "Upload Picture"}
            </Button>

            {(previewUrl || selectedFile) && (
              <Button
                variant="outline"
                onClick={handleRemoveImage}
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Remove Picture
              </Button>
            )}
          </div>

          {selectedFile && (
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4 flex-shrink-0" />
                <span
                  className="truncate"
                  title={selectedFile.name} // Show full name on hover
                >
                  {truncateFilename(selectedFile.name, MAX_FILENAME_LENGTH)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Supported formats: JPG, PNG, GIF. Max size: 5MB.
            <br />
            Changes apply after saving all settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}