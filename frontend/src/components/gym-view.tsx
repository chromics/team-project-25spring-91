"use client";

import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Gym } from "@/types/gym";

interface GymViewProps {
  gym: Gym;
  open: boolean;
  onClose: () => void;
}

const GymView: FC<GymViewProps> = ({ gym, open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{gym.name}</DialogTitle>
          <DialogDescription>{gym.address}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4 space-y-4">
          {gym.imageUrl && (
            <img
              src={gym.imageUrl}
              alt={gym.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          )}
          <div>
            <p className="font-semibold">Description:</p>
            <p>{gym.description}</p>
          </div>
          <div>
            <p className="font-semibold">Opening Hours:</p>
            <p>{gym.openingHours}</p>
          </div>
          <div>
            <p className="font-semibold">Address:</p>
            <p>{gym.address}</p>
          </div>
          <div>
            <p className="font-semibold">Equipments:</p>
            <p>{gym.equipments}</p>
          </div>
          {gym.websiteUrl && (
            <div>
              <p className="font-semibold">Website:</p>
              <a
                href={gym.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {gym.websiteUrl}
              </a>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default GymView;
