"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { AddMealDialog } from '@/components/diet/add-meal-dialog';
import { ViewEditMealDialog } from '@/components/diet/view-edit-meal-dialog';

interface FoodEntry {
  id: string;
  name: string;
  weight: number;
  calories: number;
}

interface Meal {
  title: string; 
  time: string;
  date: Date;
  calories: number;
  foodItems?: FoodEntry[];
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

// Sample data
const sampleMealLogs: DayLog[] = [
  // Today
  {
    date: new Date(),
    meals: [
      { 
        title: 'Breakfast', 
        time: "08:00", 
        date: new Date(), 
        calories: 700, 
        foodItems: [
          { id: 'b1', name: 'Oatmeal', weight: 100, calories: 380 },
          { id: 'b2', name: 'Banana', weight: 120, calories: 107 },
          { id: 'b3', name: 'Almond', weight: 25, calories: 144 },
          { id: 'b4', name: 'Greek Yogurt', weight: 120, calories: 71 }
        ]
      },
      { 
        title: 'Lunch', 
        time: "12:00", 
        date: new Date(), 
        calories: 500,
        foodItems: [
          { id: 'l1', name: 'Brown Rice', weight: 150, calories: 167 },
          { id: 'l2', name: 'Chicken Breast', weight: 120, calories: 198 },
          { id: 'l3', name: 'Broccoli', weight: 150, calories: 51 },
          { id: 'l4', name: 'Olive Oil', weight: 10, calories: 88 }
        ]
      },
      { 
        title: 'Dinner', 
        time: "19:00", 
        date: new Date(), 
        calories: 800,
        foodItems: [
          { id: 'd1', name: 'Salmon', weight: 180, calories: 374 },
          { id: 'd2', name: 'Sweet Potato', weight: 200, calories: 172 },
          { id: 'd3', name: 'Spinach', weight: 100, calories: 23 },
          { id: 'd4', name: 'Avocado', weight: 100, calories: 160 },
          { id: 'd5', name: 'Olive Oil', weight: 8, calories: 71 }
        ]
      }
    ]
  },
  // Yesterday
  {
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    meals: [
      { 
        title: 'Breakfast', 
        time: "09:00", 
        date: new Date(new Date().setDate(new Date().getDate() - 1)), 
        calories: 700, 
        foodItems: [
          { id: 'yb1', name: 'Whole Wheat Bread', weight: 80, calories: 198 },
          { id: 'yb2', name: 'Egg', weight: 150, calories: 233 },
          { id: 'yb3', name: 'Avocado', weight: 100, calories: 160 },
          { id: 'yb4', name: 'Tomato', weight: 100, calories: 18 },
          { id: 'yb5', name: 'Orange', weight: 200, calories: 94 }
        ]
      },
      { 
        title: 'Lunch', 
        time: "12:00", 
        date: new Date(new Date().setDate(new Date().getDate() - 1)), 
        calories: 500, 
        foodItems: [
          { id: 'yl1', name: 'Quinoa', weight: 150, calories: 180 },
          { id: 'yl2', name: 'Chickpeas', weight: 120, calories: 197 },
          { id: 'yl3', name: 'Bell Pepper', weight: 100, calories: 31 },
          { id: 'yl4', name: 'Cucumber', weight: 100, calories: 15 },
          { id: 'yl5', name: 'Feta', weight: 30, calories: 79 }
        ]
      },
      { 
        title: 'Dinner', 
        time: "19:00", 
        date: new Date(new Date().setDate(new Date().getDate() - 1)), 
        calories: 800, 
        foodItems: [
          { id: 'yd1', name: 'Chicken', weight: 200, calories: 350 },
          { id: 'yd2', name: 'Rice', weight: 150, calories: 195 },
          { id: 'yd3', name: 'Carrots', weight: 100, calories: 41 },
          { id: 'yd4', name: 'Broccoli', weight: 150, calories: 51 },
          { id: 'yd5', name: 'Olive Oil', weight: 18, calories: 159 }
        ]
      },
      { 
        title: 'Evening Snack', 
        time: "22:00", 
        date: new Date(new Date().setDate(new Date().getDate() - 1)), 
        calories: 300, 
        foodItems: [
          { id: 'ys1', name: 'Greek Yogurt', weight: 200, calories: 118 },
          { id: 'ys2', name: 'Blueberries', weight: 150, calories: 86 },
          { id: 'ys3', name: 'Walnuts', weight: 15, calories: 98 }
        ]
      }
    ]
  },
  // 3 Dec 2024
  {
    date: new Date("2024-12-03"),
    meals: [
      { 
        title: 'Breakfast', 
        time: "08:00", 
        date: new Date("2024-12-03"), 
        calories: 700, 
        foodItems: [
          { id: 'db1', name: 'Oatmeal', weight: 100, calories: 380 },
          { id: 'db2', name: 'Almond Milk', weight: 250, calories: 38 },
          { id: 'db3', name: 'Strawberries', weight: 150, calories: 48 },
          { id: 'db4', name: 'Peanut Butter', weight: 40, calories: 235 }
        ]
      },
      { 
        title: 'Lunch', 
        time: "14:00", 
        date: new Date("2024-12-03"), 
        calories: 800, 
        foodItems: [
          { id: 'dl1', name: 'Tuna', weight: 150, calories: 195 },
          { id: 'dl2', name: 'Whole Wheat Bread', weight: 80, calories: 198 },
          { id: 'dl3', name: 'Avocado', weight: 100, calories: 160 },
          { id: 'dl4', name: 'Lettuce', weight: 50, calories: 8 },
          { id: 'dl5', name: 'Tomato', weight: 100, calories: 18 },
          { id: 'dl6', name: 'Apple', weight: 180, calories: 94 },
          { id: 'dl7', name: 'Cashews', weight: 25, calories: 138 }
        ]
      },
      { 
        title: 'Dinner', 
        time: "18:00", 
        date: new Date("2024-12-03"), 
        calories: 800, 
        foodItems: [
          { id: 'dd1', name: 'Beef', weight: 150, calories: 375 },
          { id: 'dd2', name: 'Potato', weight: 200, calories: 154 },
          { id: 'dd3', name: 'Asparagus', weight: 150, calories: 30 },
          { id: 'dd4', name: 'Mushroom', weight: 100, calories: 22 },
          { id: 'dd5', name: 'Olive Oil', weight: 15, calories: 133 },
          { id: 'dd6', name: 'Parmesan', weight: 20, calories: 86 }
        ]
      }
    ]
  }
];

const MealLogger: React.FC = () => {
  const [mealLogs, setMealLogs] = useState<DayLog[]>(sampleMealLogs);
  const [addMealDialogOpen, setAddMealDialogOpen] = useState<boolean>(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [viewMealDialogOpen, setViewMealDialogOpen] = useState<boolean>(false);

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
    setViewMealDialogOpen(true);
  };

  // Add new meal to logs
  const handleAddNewMeal = (meal: Meal) => {
    const mealDate = meal.date;
    
    // Find the log for this date or create a new one
    const updatedLogs = [...mealLogs];
    const logIndex = updatedLogs.findIndex(log => isSameDay(log.date, mealDate));
    
    if (logIndex >= 0) {
      // Add to existing log
      updatedLogs[logIndex].meals.push(meal);
      // Sort meals within this day by time
      updatedLogs[logIndex].meals.sort((a, b) => {
        const timeA = new Date(`1970-01-01T${a.time}`);
        const timeB = new Date(`1970-01-01T${b.time}`);
        return timeA.getTime() - timeB.getTime();
      });
    } else {
      // Create new log for this date
      updatedLogs.push({
        date: mealDate,
        meals: [meal]
      });
    }
    
    // Sort days in descending order (newest first)
    updatedLogs.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    setMealLogs(updatedLogs);
  };

  // Delete a meal
  const handleDeleteMeal = (mealToDelete: Meal) => {
    const updatedLogs = mealLogs.map(dayLog => {
      // If this day doesn't contain the meal, return it unchanged
      if (!isSameDay(dayLog.date, mealToDelete.date)) {
        return dayLog;
      }
      
      // Filter out the meal to delete
      const updatedMeals = dayLog.meals.filter(meal => 
        !(meal.title === mealToDelete.title && 
          meal.time === mealToDelete.time && 
          meal.calories === mealToDelete.calories)
      );
      
      return {
        ...dayLog,
        meals: updatedMeals
      };
    });
    
    // Remove any days that now have no meals
    const filteredLogs = updatedLogs.filter(dayLog => dayLog.meals.length > 0);
    
    setMealLogs(filteredLogs);
    setViewMealDialogOpen(false);
  };

  // Update a meal
  const handleUpdateMeal = (oldMeal: Meal, updatedMeal: Meal) => {
    const updatedLogs = [...mealLogs];
    
    // Find the day log that contains the old meal
    const oldDayIndex = updatedLogs.findIndex(log => 
      isSameDay(log.date, oldMeal.date)
    );
    
    if (oldDayIndex >= 0) {
      // Find the meal within that day
      const mealIndex = updatedLogs[oldDayIndex].meals.findIndex(meal => 
        meal.title === oldMeal.title && 
        meal.time === oldMeal.time &&
        meal.calories === oldMeal.calories
      );
      
      if (mealIndex >= 0) {
        // Check if the date has changed
        if (isSameDay(oldMeal.date, updatedMeal.date)) {
          // Same day, just update the meal
          updatedLogs[oldDayIndex].meals[mealIndex] = updatedMeal;
          
          // Sort meals within this day by time
          updatedLogs[oldDayIndex].meals.sort((a, b) => {
            const timeA = new Date(`1970-01-01T${a.time}`);
            const timeB = new Date(`1970-01-01T${b.time}`);
            return timeA.getTime() - timeB.getTime();
          });
        } else {
          // Date changed, remove from old day and add to new day
          updatedLogs[oldDayIndex].meals.splice(mealIndex, 1);
          
          // Find or create the log for the new date
          const newDayIndex = updatedLogs.findIndex(log => 
            isSameDay(log.date, updatedMeal.date)
          );
          
          if (newDayIndex >= 0) {
            // Add to existing day
            updatedLogs[newDayIndex].meals.push(updatedMeal);
            // Sort meals within this day by time
            updatedLogs[newDayIndex].meals.sort((a, b) => {
              const timeA = new Date(`1970-01-01T${a.time}`);
              const timeB = new Date(`1970-01-01T${b.time}`);
              return timeA.getTime() - timeB.getTime();
            });
          } else {
            // Create new day log
            updatedLogs.push({
              date: updatedMeal.date,
              meals: [updatedMeal]
            });
          }
          
          // Remove old day if it now has no meals
          if (updatedLogs[oldDayIndex].meals.length === 0) {
            updatedLogs.splice(oldDayIndex, 1);
          }
        }
      }
    }
    
    // Sort days in descending order (newest first)
    updatedLogs.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    setMealLogs(updatedLogs);
    setSelectedMeal(updatedMeal);
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

      {/* View/Edit Meal Dialog */}
      {selectedMeal && (
        <ViewEditMealDialog
          open={viewMealDialogOpen}
          onOpenChange={setViewMealDialogOpen}
          meal={selectedMeal}
          onDeleteMeal={handleDeleteMeal}
          onUpdateMeal={handleUpdateMeal}
          foodItems={commonFoodItems}
        />
      )}
    </div>
  );
};

export default MealLogger;