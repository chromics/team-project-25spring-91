"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddMealDialog } from '@/components/diet/add-meal-dialog';

interface Meal {
  title: string; 
  time: string;
  calories: number;
}

interface DayLog {
  date: Date;
  meals: Meal[];
}

interface FoodItem {
  label: string;
  value: string;
  caloriesPerGram: number;
}

// Constants
const DAILY_CALORIE_GOAL = 2500;
const MAX_MEALS_PER_DAY = 10;

// Common food items with calories per gram
const commonFoodItems: FoodItem[] = [
  { label: 'Apple', value: 'apple', caloriesPerGram: 0.52 },
  { label: 'Banana', value: 'banana', caloriesPerGram: 0.89 },
  { label: 'Beef', value: 'beef', caloriesPerGram: 2.5 },
  { label: 'Broccoli', value: 'broccoli', caloriesPerGram: 0.34 },
  { label: 'Brown Rice', value: 'brown-rice', caloriesPerGram: 1.11 },
  { label: 'Carrot', value: 'carrot', caloriesPerGram: 0.41 },
  { label: 'Chicken Breast', value: 'chicken-breast', caloriesPerGram: 1.65 },
  { label: 'Chicken', value: 'chicken', caloriesPerGram: 1.75 },
  { label: 'Egg', value: 'egg', caloriesPerGram: 1.55 },
  { label: 'Oatmeal', value: 'oatmeal', caloriesPerGram: 3.8 },
  { label: 'Potato', value: 'potato', caloriesPerGram: 0.77 },
  { label: 'Rice', value: 'rice', caloriesPerGram: 1.3 },
  { label: 'Salmon', value: 'salmon', caloriesPerGram: 2.08 },
  { label: 'Sweet Potato', value: 'sweet-potato', caloriesPerGram: 0.86 },
  { label: 'Tofu', value: 'tofu', caloriesPerGram: 0.76 },
  { label: 'White Bread', value: 'white-bread', caloriesPerGram: 2.65 },
  { label: 'Whole Wheat Bread', value: 'whole-wheat-bread', caloriesPerGram: 2.47 },
  { label: 'Avocado', value: 'avocado', caloriesPerGram: 1.6 },
  { label: 'Spinach', value: 'spinach', caloriesPerGram: 0.23 },
  { label: 'Almond', value: 'almond', caloriesPerGram: 5.76 },
  { label: 'Greek Yogurt', value: 'greek-yogurt', caloriesPerGram: 0.59 },
  { label: 'Peanut Butter', value: 'peanut-butter', caloriesPerGram: 5.88 },
  { label: 'Tuna', value: 'tuna', caloriesPerGram: 1.3 },
  { label: 'Black Beans', value: 'black-beans', caloriesPerGram: 1.3 },
  { label: 'Quinoa', value: 'quinoa', caloriesPerGram: 1.2 },
  { label: 'Lentils', value: 'lentils', caloriesPerGram: 1.16 },
  { label: 'Blueberries', value: 'blueberries', caloriesPerGram: 0.57 },
  { label: 'Strawberries', value: 'strawberries', caloriesPerGram: 0.32 },
  { label: 'Orange', value: 'orange', caloriesPerGram: 0.47 },
  { label: 'Watermelon', value: 'watermelon', caloriesPerGram: 0.3 },
  { label: 'Pineapple', value: 'pineapple', caloriesPerGram: 0.5 },
  { label: 'Grapes', value: 'grapes', caloriesPerGram: 0.69 },
  { label: 'Kiwi', value: 'kiwi', caloriesPerGram: 0.61 },
  { label: 'Mango', value: 'mango', caloriesPerGram: 0.6 },
  { label: 'Pear', value: 'pear', caloriesPerGram: 0.57 },
  { label: 'Peach', value: 'peach', caloriesPerGram: 0.39 },
  { label: 'Kale', value: 'kale', caloriesPerGram: 0.49 },
  { label: 'Cauliflower', value: 'cauliflower', caloriesPerGram: 0.25 },
  { label: 'Cucumber', value: 'cucumber', caloriesPerGram: 0.15 },
  { label: 'Bell Pepper', value: 'bell-pepper', caloriesPerGram: 0.31 },
  { label: 'Zucchini', value: 'zucchini', caloriesPerGram: 0.17 },
  { label: 'Tomato', value: 'tomato', caloriesPerGram: 0.18 },
  { label: 'Mushroom', value: 'mushroom', caloriesPerGram: 0.22 },
  { label: 'Onion', value: 'onion', caloriesPerGram: 0.4 },
  { label: 'Garlic', value: 'garlic', caloriesPerGram: 1.49 },
  { label: 'Ginger', value: 'ginger', caloriesPerGram: 0.8 },
  { label: 'Pork', value: 'pork', caloriesPerGram: 2.42 },
  { label: 'Turkey', value: 'turkey', caloriesPerGram: 1.89 },
  { label: 'Lamb', value: 'lamb', caloriesPerGram: 2.94 },
  { label: 'Shrimp', value: 'shrimp', caloriesPerGram: 0.99 },
  { label: 'Cod', value: 'cod', caloriesPerGram: 0.82 },
  { label: 'Tilapia', value: 'tilapia', caloriesPerGram: 1.28 },
  { label: 'Trout', value: 'trout', caloriesPerGram: 1.9 },
  { label: 'Sardines', value: 'sardines', caloriesPerGram: 2.08 },
  { label: 'Crab', value: 'crab', caloriesPerGram: 0.83 },
  { label: 'Lobster', value: 'lobster', caloriesPerGram: 0.89 },
  { label: 'Oysters', value: 'oysters', caloriesPerGram: 0.68 },
  { label: 'Walnuts', value: 'walnuts', caloriesPerGram: 6.54 },
  { label: 'Pecans', value: 'pecans', caloriesPerGram: 6.87 },
  { label: 'Cashews', value: 'cashews', caloriesPerGram: 5.53 },
  { label: 'Pistachios', value: 'pistachios', caloriesPerGram: 5.62 },
  { label: 'Hazelnuts', value: 'hazelnuts', caloriesPerGram: 6.28 },
  { label: 'Chia Seeds', value: 'chia-seeds', caloriesPerGram: 4.86 },
  { label: 'Flaxseeds', value: 'flaxseeds', caloriesPerGram: 5.34 },
  { label: 'Hemp Seeds', value: 'hemp-seeds', caloriesPerGram: 5.53 },
  { label: 'Pumpkin Seeds', value: 'pumpkin-seeds', caloriesPerGram: 5.46 },
  { label: 'Sunflower Seeds', value: 'sunflower-seeds', caloriesPerGram: 5.84 },
  { label: 'Chickpeas', value: 'chickpeas', caloriesPerGram: 1.64 },
  { label: 'Kidney Beans', value: 'kidney-beans', caloriesPerGram: 1.33 },
  { label: 'Pinto Beans', value: 'pinto-beans', caloriesPerGram: 1.43 },
  { label: 'Navy Beans', value: 'navy-beans', caloriesPerGram: 1.37 },
  { label: 'Lima Beans', value: 'lima-beans', caloriesPerGram: 1.15 },
  { label: 'Green Peas', value: 'green-peas', caloriesPerGram: 0.81 },
  { label: 'Edamame', value: 'edamame', caloriesPerGram: 1.21 },
  { label: 'Corn', value: 'corn', caloriesPerGram: 0.86 },
  { label: 'Asparagus', value: 'asparagus', caloriesPerGram: 0.2 },
  { label: 'Brussels Sprouts', value: 'brussels-sprouts', caloriesPerGram: 0.43 },
  { label: 'Cabbage', value: 'cabbage', caloriesPerGram: 0.25 },
  { label: 'Celery', value: 'celery', caloriesPerGram: 0.16 },
  { label: 'Eggplant', value: 'eggplant', caloriesPerGram: 0.25 },
  { label: 'Lettuce', value: 'lettuce', caloriesPerGram: 0.15 },
  { label: 'Radish', value: 'radish', caloriesPerGram: 0.16 },
  { label: 'Turnip', value: 'turnip', caloriesPerGram: 0.28 },
  { label: 'Beets', value: 'beets', caloriesPerGram: 0.43 },
  { label: 'Pumpkin', value: 'pumpkin', caloriesPerGram: 0.26 },
  { label: 'Squash', value: 'squash', caloriesPerGram: 0.18 },
  { label: 'Cottage Cheese', value: 'cottage-cheese', caloriesPerGram: 0.98 },
  { label: 'Cheddar Cheese', value: 'cheddar-cheese', caloriesPerGram: 4.03 },
  { label: 'Mozzarella', value: 'mozzarella', caloriesPerGram: 2.8 },
  { label: 'Parmesan', value: 'parmesan', caloriesPerGram: 4.31 },
  { label: 'Feta', value: 'feta', caloriesPerGram: 2.64 },
  { label: 'Goat Cheese', value: 'goat-cheese', caloriesPerGram: 3.64 },
  { label: 'Milk', value: 'milk', caloriesPerGram: 0.42 },
  { label: 'Almond Milk', value: 'almond-milk', caloriesPerGram: 0.15 },
  { label: 'Soy Milk', value: 'soy-milk', caloriesPerGram: 0.33 },
  { label: 'Coconut Milk', value: 'coconut-milk', caloriesPerGram: 2.3 },
  { label: 'Oat Milk', value: 'oat-milk', caloriesPerGram: 0.48 },
  { label: 'Olive Oil', value: 'olive-oil', caloriesPerGram: 8.84 },
  { label: 'Coconut Oil', value: 'coconut-oil', caloriesPerGram: 8.92 },
  { label: 'Avocado Oil', value: 'avocado-oil', caloriesPerGram: 8.84 }
];

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

  // Add new meal to logs
  const handleAddNewMeal = (meal: Meal) => {
    const today = new Date();
    
    // Find today's log or create a new one
    const updatedLogs = [...mealLogs];
    const todayLogIndex = updatedLogs.findIndex(log => isSameDay(log.date, today));
    
    if (todayLogIndex >= 0) {
      // Add to existing log
      updatedLogs[todayLogIndex].meals.push(meal);
    } else {
      // Create new log for today
      updatedLogs.push({
        date: today,
        meals: [meal]
      });
    }
    
    setMealLogs(updatedLogs);
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
      <AddMealDialog 
        open={addMealDialogOpen} 
        onOpenChange={setAddMealDialogOpen}
        onAddMeal={handleAddNewMeal}
        foodItems={commonFoodItems}
      />

      {/* Meal Details Dialog */}
      <Dialog open={mealDetailDialogOpen} onOpenChange={setMealDetailDialogOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedMeal?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedMeal && (
              <div className="space-y-4">
                <div>
                  <span className="font-medium">Time:</span> {selectedMeal.time}
                </div>
                <div>
                  <span className="font-medium">Calories:</span> {selectedMeal.calories}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealLogger;