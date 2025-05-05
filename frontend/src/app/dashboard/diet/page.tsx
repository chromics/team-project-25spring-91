"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Meal {
  title: string; 
  time: string;
  calories: number;
}

interface DayLog {
  date: Date;
  meals: Meal[];
}

// Constants
const DAILY_CALORIE_GOAL = 2500;
const MAX_MEALS_PER_DAY = 10;

// Sample data - would come from an API or state management
const sampleMealLogs: DayLog[] = [
  // Today
  {
    date: new Date(),
    meals: [
      { title: 'Breakfast', time: "08:00", calories: 700 },
      { title: 'Lunch', time: "12:00", calories: 500 },
      { title: 'Dinner', time: "19:00", calories: 800 }
    ]
  },
  // Yesterday
  {
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    meals: [
      { title: 'Breakfast', time: "09:00", calories: 700 },
      { title: 'Lunch', time: "12:00", calories: 500 },
      { title: 'Dinner', time: "19:00", calories: 800 },
      { title: 'Evening Snack', time: "22:00", calories: 300 }
    ]
  },
  // 3 Dec 2024
  {
    date: new Date("2024-12-03"),
    meals: [
      { title: 'Breakfast', time: "08:00", calories: 700 },
      { title: 'Lunch', time: "14:00", calories: 800 },
      { title: 'Dinner', time: "18:00", calories: 800 }
    ]
  }
];

const MealLogger: React.FC = () => {
  const [mealLogs, setMealLogs] = useState<DayLog[]>(sampleMealLogs);
  const [addMealDialogOpen, setAddMealDialogOpen] = useState<boolean>(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [mealDetailDialogOpen, setMealDetailDialogOpen] = useState<boolean>(false);

  // Utility functions
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const formatDateHeader = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (isSameDay(date, today)) {
      return "Today";
    } else if (isSameDay(date, yesterday)) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  };

  const countMeals = (meals: Meal[]): number => {
    return meals.length;
  };

  const calculateTotalCalories = (meals: Meal[]): number => {
    return meals.reduce((sum, meal) => sum + meal.calories, 0);
  };

  // Get sorted logs and ensure today is always included
  const getSortedLogsWithToday = (): DayLog[] => {
    const today = new Date();
    const sortedLogs = [...mealLogs].sort((a, b) => b.date.getTime() - a.date.getTime());
    
    const hasTodayLog = sortedLogs.some(log => isSameDay(log.date, today));
    
    if (!hasTodayLog) {
      return [{ date: today, meals: [] }, ...sortedLogs];
    }
    
    return sortedLogs;
  };

  // Get today's total calories for the goal display
  const getTodaysTotalCalories = (): number => {
    const today = new Date();
    const todayLog = mealLogs.find(log => isSameDay(log.date, today));
    return todayLog ? calculateTotalCalories(todayLog.meals) : 0;
  };

  const handleAddMeal = () => {
    setAddMealDialogOpen(true);
  };

  const handleOpenMealDetails = (meal: Meal) => {
    setSelectedMeal(meal);
    setMealDetailDialogOpen(true);
  };

  // Component to render a meal card
  const MealCard: React.FC<{ meal: Meal }> = ({ meal }) => {
    return (
      <Card 
        className="w-[180px] cursor-pointer hover:shadow-md transition-shadow border-border" 
        onClick={() => handleOpenMealDetails(meal)}
      >
        <CardContent>
          <div className="font-semibold text-foreground">
            {meal.title}
          </div>
          <div className="w-full mt-1.5 mb-2 border-b-[1px] border-primary/50" />
          <div className="text-sm text-muted-foreground mb-1">
            Time: {meal.time}
          </div>
          <div className="text-sm text-muted-foreground mb-1">
            Calories:
          </div>
          <div className="font-semibold text-xl text-center">
            {meal.calories}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Component to render a date section with meal cards
  const DateSection: React.FC<{ dayLog: DayLog }> = ({ dayLog }) => {
    const { date, meals } = dayLog;
    const totalMeals = countMeals(meals);
    const totalCalories = calculateTotalCalories(meals);
    
    const dateStr = formatDateHeader(date);
    const isToday = dateStr === "Today";
    
    let headerText = dateStr;
    if (isToday) {
      headerText += ` (${totalMeals}/${MAX_MEALS_PER_DAY})`;
    } else {
      headerText += ` (${totalMeals} meals, Total Calories: ${totalCalories})`;
    }

    return (
      <div className="mb-6">
        <div className="font-semibold mb-2">{headerText}</div>
        
        {meals.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {meals.map((meal, index) => (
              <MealCard key={index} meal={meal} />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            No meals logged yet today
          </div>
        )}
      </div>
    );
  };

  const sortedLogsWithToday = getSortedLogsWithToday();

  return (
    <div className="container mx-auto p-4">
      <div className="border border-border rounded-[var(--radius)] p-6">
        <h1 className="text-2xl font-semibold mb-2 text-foreground">Meal Log</h1>
        
        <div className="text-base text-muted-foreground mb-6">
          Daily calorie goals: {getTodaysTotalCalories()}/{DAILY_CALORIE_GOAL}
        </div>
        
        <div>
          {sortedLogsWithToday.map((dayLog, index) => (
            <DateSection key={index} dayLog={dayLog} />
          ))}
        </div>
        
        <Button 
          variant="default" 
          size="icon" 
          className="fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-md z-10"
          onClick={handleAddMeal}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Meal Dialog */}
      <Dialog open={addMealDialogOpen} onOpenChange={setAddMealDialogOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Log Meal</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* Form content will be added here */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Meal Details Dialog */}
      <Dialog open={mealDetailDialogOpen} onOpenChange={setMealDetailDialogOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedMeal?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* Meal detail content will be added here */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealLogger;