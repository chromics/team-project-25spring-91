"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import GymOwnerCard from "@/components/gym-owner-card";
import type { Gym, Membership, GymClass, Schedule, ID } from "@/types/gym";

export default function GymFormPage() {
  const [memberships, setMemberships] = useState<Membership[]>([{ 
    id: "", 
    name: "", 
    price: "", 
    description: "" 
  }]);
  
  const [classes, setClasses] = useState<GymClass[]>([
    {
      id: "",
      name: "",
      description: "",
      price: "",
      maxCapacity: "",
      image: "",
      duration: "",
      membersOnly: false,
      difficulty: "",
      schedules: [{ id: "", startTime: "", endTime: "", instructor: "" }]
    }
  ]);

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGymIndex, setSelectedGymIndex] = useState<number | null>(null);
  const [gymForm, setGymForm] = useState({
    name: "",
    openingHours: "",
    address: "",
    location: "",
    contactInfo: "",
    equipments: "",
    imageUrl: "",
    websiteUrl: "",
    description: "",
  });

  const handleAddClass = () => {
    setClasses([
      ...classes,
      {
        id: "",
        name: "",
        description: "",
        price: "",
        maxCapacity: "",
        image: "",
        duration: "",
        membersOnly: false,
        difficulty: "",
        schedules: [{ id: "", startTime: "", endTime: "", instructor: "" }],
      },
    ]);
  };

  const handleAddSchedule = (classIndex: number) => {
    const updated = [...classes];
    updated[classIndex].schedules.push({ id: "", startTime: "", endTime: "", instructor: "" });
    setClasses(updated);
  };

  const handleAddGym = () => {
    const newGym: Gym = {
      id: selectedGymIndex !== null ? gyms[selectedGymIndex].id : "", // Preserve ID when editing
      name: gymForm.name,
      openingHours: gymForm.openingHours,
      address: gymForm.address,
      location: gymForm.location,
      contactInfo: gymForm.contactInfo,
      equipments: gymForm.equipments,
      imageUrl: gymForm.imageUrl,
      websiteUrl: gymForm.websiteUrl,
      description: gymForm.description,
      memberships: memberships,
      classes: classes,
    };

    if (selectedGymIndex !== null) {
      const updatedGyms = [...gyms];
      updatedGyms[selectedGymIndex] = newGym;
      setGyms(updatedGyms);
    } else {
      setGyms([...gyms, newGym]);
    }

    // Reset form
    setSelectedGymIndex(null);
    setGymForm({ 
      name: "", 
      openingHours: "", 
      address: "", 
      location: "", 
      contactInfo: "", 
      equipments: "", 
      imageUrl: "", 
      websiteUrl: "", 
      description: "" 
    });
    setMemberships([{ id: "", name: "", price: "", description: "" }]);
    setClasses([
      {
        id: "",
        name: "",
        description: "",
        price: "",
        maxCapacity: "",
        image: "",
        duration: "",
        membersOnly: false,
        difficulty: "",
        schedules: [{ id: "", startTime: "", endTime: "", instructor: "" }]
      }
    ]);
  };

  const handleSelectGym = (index: number) => {
    const gym = gyms[index];
    setSelectedGymIndex(index);
    setGymForm({
      name: gym.name,
      openingHours: gym.openingHours || "",
      address: gym.address || "",
      location: gym.location || "",
      contactInfo: gym.contactInfo || "",
      equipments: gym.equipments || "",
      imageUrl: gym.imageUrl || "",
      websiteUrl: gym.websiteUrl || "",
      description: gym.description || "",
    });
    
    // Use memberships and classes from the gym or defaults if none exist
    setMemberships(gym.memberships?.length ? gym.memberships : [{ id: "", name: "", price: "", description: "" }]);
    setClasses(gym.classes?.length ? gym.classes : [
      {
        id: "",
        name: "",
        description: "",
        price: "",
        maxCapacity: "",
        image: "",
        duration: "",
        membersOnly: false,
        difficulty: "",
        schedules: [{ id: "", startTime: "", endTime: "", instructor: "" }]
      }
    ]);
  };

  const handleDeleteGym = (index: number) => {
    const updatedGyms = gyms.filter((_, i) => i !== index);
    setGyms(updatedGyms);
    
    if (selectedGymIndex === index) {
      setSelectedGymIndex(null);
      setGymForm({ 
        name: "", 
        openingHours: "", 
        address: "", 
        location: "", 
        contactInfo: "", 
        equipments: "", 
        imageUrl: "", 
        websiteUrl: "", 
        description: "" 
      });
      setMemberships([{ id: "", name: "", price: "", description: "" }]);
      setClasses([
        {
          id: "",
          name: "",
          description: "",
          price: "",
          maxCapacity: "",
          image: "",
          duration: "",
          membersOnly: false,
          difficulty: "",
          schedules: [{ id: "", startTime: "", endTime: "", instructor: "" }]
        }
      ]);
    }
  };

  const resetForm = () => {
    setSelectedGymIndex(null);
    setGymForm({ 
      name: "", 
      openingHours: "", 
      address: "", 
      location: "", 
      contactInfo: "", 
      equipments: "", 
      imageUrl: "", 
      websiteUrl: "", 
      description: "" 
    });
    setMemberships([{ id: "", name: "", price: "", description: "" }]);
    setClasses([
      {
        id: "",
        name: "",
        description: "",
        price: "",
        maxCapacity: "",
        image: "",
        duration: "",
        membersOnly: false,
        difficulty: "",
        schedules: [{ id: "", startTime: "", endTime: "", instructor: "" }]
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{selectedGymIndex !== null ? "Edit Your Gym" : "Add Your Gyms"}</h1>
        <p className="text-gray-600">Fill out the form below to {selectedGymIndex !== null ? "update" : "add"} your gym to our list.</p>
      </div>

      {/* Gym Cards Section */}
      <div className="space-y-4">
        {gyms.length === 0 ? (
          <p className="text-center text-gray-500">No gyms added yet.</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {gyms.map((gym, index) => (
              <div key={index} className="min-w-[200px]">
                <GymOwnerCard
                  gym={gym}
                  onEdit={() => handleSelectGym(index)}
                  onDelete={() => handleDeleteGym(index)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gym Form */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Input placeholder="Gym Name" value={gymForm.name} onChange={(e) => setGymForm({ ...gymForm, name: e.target.value })} />
          <Input placeholder="Opening Hours" value={gymForm.openingHours} onChange={(e) => setGymForm({ ...gymForm, openingHours: e.target.value })} />
          <Textarea placeholder="Address" value={gymForm.address} onChange={(e) => setGymForm({ ...gymForm, address: e.target.value })} />
          <Input placeholder="Location" value={gymForm.location} onChange={(e) => setGymForm({ ...gymForm, location: e.target.value })} />
          <Input placeholder="Contact Info" value={gymForm.contactInfo} onChange={(e) => setGymForm({ ...gymForm, contactInfo: e.target.value })} />
          <Textarea placeholder="Available Equipments" value={gymForm.equipments} onChange={(e) => setGymForm({ ...gymForm, equipments: e.target.value })} />
          <Input placeholder="Image URL" value={gymForm.imageUrl} onChange={(e) => setGymForm({ ...gymForm, imageUrl: e.target.value })} />
          <Input placeholder="Website URL" value={gymForm.websiteUrl} onChange={(e) => setGymForm({ ...gymForm, websiteUrl: e.target.value })} />
          <Textarea placeholder="Description" value={gymForm.description} onChange={(e) => setGymForm({ ...gymForm, description: e.target.value })} />
        </div>

        {/* Memberships */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Memberships</h2>
          {memberships.map((membership, index) => (
            <div key={index} className="space-y-2 border p-4 rounded-xl">
              <Input placeholder="Category Name" value={membership.name} onChange={(e) => {
                const updated = [...memberships];
                updated[index].name = e.target.value;
                setMemberships(updated);
              }} />
              <Input placeholder="Price" value={membership.price} onChange={(e) => {
                const updated = [...memberships];
                updated[index].price = e.target.value;
                setMemberships(updated);
              }} />
              <Textarea placeholder="Description" value={membership.description} onChange={(e) => {
                const updated = [...memberships];
                updated[index].description = e.target.value;
                setMemberships(updated);
              }} />
            </div>
          ))}
          <Button onClick={() => setMemberships([...memberships, { id: "", name: "", price: "", description: "" }])}>Add Membership Category</Button>
        </div>

        {/* Classes */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Classes</h2>
          {classes.map((cls, classIndex) => (
            <div key={classIndex} className="space-y-2 border p-4 rounded-xl">
              <Input placeholder="Class Name" value={cls.name} onChange={(e) => {
                const updated = [...classes];
                updated[classIndex].name = e.target.value;
                setClasses(updated);
              }} />
              <Textarea placeholder="Description" value={cls.description} onChange={(e) => {
                const updated = [...classes];
                updated[classIndex].description = e.target.value;
                setClasses(updated);
              }} />
              <Input placeholder="Price" value={cls.price} onChange={(e) => {
                const updated = [...classes];
                updated[classIndex].price = e.target.value;
                setClasses(updated);
              }} />
              <Input placeholder="Max Capacity" value={cls.maxCapacity} onChange={(e) => {
                const updated = [...classes];
                updated[classIndex].maxCapacity = e.target.value;
                setClasses(updated);
              }} />
              <Input placeholder="Image URL" value={cls.image} onChange={(e) => {
                const updated = [...classes];
                updated[classIndex].image = e.target.value;
                setClasses(updated);
              }} />
              <Input placeholder="Duration (e.g., 1h 30m)" value={cls.duration} onChange={(e) => {
                const updated = [...classes];
                updated[classIndex].duration = e.target.value;
                setClasses(updated);
              }} />
              <Input placeholder="Difficulty Level" value={cls.difficulty} onChange={(e) => {
                const updated = [...classes];
                updated[classIndex].difficulty = e.target.value;
                setClasses(updated);
              }} />
              <div className="flex items-center space-x-2">
                <Label>Members Only</Label>
                <Switch checked={cls.membersOnly} onCheckedChange={(val: boolean) => {
                  const updated = [...classes];
                  updated[classIndex].membersOnly = val;
                  setClasses(updated);
                }} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Schedules</h3>
                {cls.schedules.map((schedule, schedIndex) => (
                  <div key={schedIndex} className="grid grid-cols-3 gap-2">
                    <Input placeholder="Start Time" type="time" value={schedule.startTime} onChange={(e) => {
                      const updated = [...classes];
                      updated[classIndex].schedules[schedIndex].startTime = e.target.value;
                      setClasses(updated);
                    }} />
                    <Input placeholder="End Time" type="time" value={schedule.endTime} onChange={(e) => {
                      const updated = [...classes];
                      updated[classIndex].schedules[schedIndex].endTime = e.target.value;
                      setClasses(updated);
                    }} />
                    <Input placeholder="Instructor" value={schedule.instructor} onChange={(e) => {
                      const updated = [...classes];
                      updated[classIndex].schedules[schedIndex].instructor = e.target.value;
                      setClasses(updated);
                    }} />
                  </div>
                ))}
                <Button variant="secondary" onClick={() => handleAddSchedule(classIndex)}>
                  Add Schedule
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={handleAddClass}>Add Class</Button>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleAddGym}>{selectedGymIndex !== null ? "Update Gym" : "Save Gym"}</Button>
          {selectedGymIndex !== null && (
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          )}
        </div>
      </div>
    </div>
  );
}