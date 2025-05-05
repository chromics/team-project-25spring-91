"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function GymFormPage() {
  const [memberships, setMemberships] = useState([{ name: "", price: "", description: "" }]);
  const [classes, setClasses] = useState([
    {
      name: "",
      description: "",
      price: "",
      maxCapacity: "",
      image: "",
      duration: "",
      membersOnly: false,
      difficulty: "",
      schedules: [{ startTime: "", endTime: "", instructor: "" }]
    }
  ]);

  const handleAddMembership = () => {
    setMemberships([...memberships, { name: "", price: "", description: "" }]);
  };

  const handleAddClass = () => {
    setClasses([
      ...classes,
      {
        name: "",
        description: "",
        price: "",
        maxCapacity: "",
        image: "",
        duration: "",
        membersOnly: false,
        difficulty: "",
        schedules: [{ startTime: "", endTime: "", instructor: "" }]
      }
    ]);
  };

  const handleAddSchedule = (classIndex: number) => {
    const updatedClasses = [...classes];
    updatedClasses[classIndex].schedules.push({ startTime: "", endTime: "", instructor: "" });
    setClasses(updatedClasses);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Create Gym Profile</h1>
      <p className="text-gray-600">Please provide the details of your gym and its offerings.</p>

      {/* Basic Info */}
      <div className="space-y-4">
        <Input placeholder="Gym Name" />
        <Input placeholder="Opening Hours" />
        <Textarea placeholder="Address" />
        <Textarea placeholder="Available Equipments" />
      </div>

      {/* Memberships */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Memberships</h2>
        {memberships.map((membership, index) => (
          <div key={index} className="space-y-2 border p-4 rounded-xl">
            <Input placeholder="Category Name" />
            <Input placeholder="Price" type="number" />
            <Textarea placeholder="Description" />
          </div>
        ))}
        <Button onClick={handleAddMembership}>Add Membership Category</Button>
      </div>

      {/* Classes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Classes</h2>
        {classes.map((cls, classIndex) => (
          <div key={classIndex} className="space-y-2 border p-4 rounded-xl">
            <Input placeholder="Class Name" />
            <Textarea placeholder="Description" />
            <Input placeholder="Price" type="number" />
            <Input placeholder="Max Capacity" type="number" />
            <Input placeholder="Image URL" />
            <Input placeholder="Duration (e.g., 1h 30m)" />
            <Input placeholder="Difficulty Level" />
            <div className="flex items-center space-x-2">
              <Label>Members Only</Label>
              <Switch />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Schedules</h3>
              {cls.schedules.map((schedule, schedIndex) => (
                <div key={schedIndex} className="grid grid-cols-3 gap-2">
                  <Input placeholder="Start Time" type="time" />
                  <Input placeholder="End Time" type="time" />
                  <Input placeholder="Instructor" />
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
    </div>
  );
}
