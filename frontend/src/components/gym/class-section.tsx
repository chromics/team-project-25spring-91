// components/class-section.tsx
'use client';

import { useState } from 'react';
import type { GymClass } from '@/types/gym';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassCard } from './class-card';

interface ClassSectionProps {
  classes: GymClass[];
}

export function ClassSection({ classes }: ClassSectionProps) {
  const groupedClasses = classes.reduce((acc, gymClass) => {
    const level = gymClass.difficultyLevel || 'all';
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(gymClass);
    return acc;
  }, {} as Record<string, GymClass[]>);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Available Classes</h2>
      </div>

      <Tabs defaultValue="all" className="w-full space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Classes</TabsTrigger>
          {Object.keys(groupedClasses).map(level => (
            level !== 'all' && (
              <TabsTrigger key={level} value={level} className="capitalize">
                {level}
              </TabsTrigger>
            )
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map(gymClass => (
              <ClassCard key={gymClass.id} gymClass={gymClass} />
            ))}
          </div>
        </TabsContent>

        {Object.entries(groupedClasses).map(([level, levelClasses]) => (
          level !== 'all' && (
            <TabsContent key={level} value={level} className="mt-0">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {levelClasses.map(gymClass => (
                  <ClassCard key={gymClass.id} gymClass={gymClass} />
                ))}
              </div>
            </TabsContent>
          )
        ))}
      </Tabs>
    </div>
  );
}