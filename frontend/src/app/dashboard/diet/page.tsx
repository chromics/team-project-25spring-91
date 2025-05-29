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
  quantity: number;
  calories: number;
  foodValue: string; 
  servingUnit: string;
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
  servingUnit: string;
}

// Constants
const DAILY_CALORIE_GOAL = 2500;
const MAX_MEALS_PER_DAY = 10;

// Common food items with calories per gram
const commonFoodItems: FoodItem[] = [
  { label: 'Apple', value: 'apple', caloriesPerGram: 0.52, servingUnit: 'g' },
  { label: 'Banana', value: 'banana', caloriesPerGram: 0.89, servingUnit: 'g' },
  { label: 'Beef', value: 'beef', caloriesPerGram: 2.5, servingUnit: 'g' },
  { label: 'Broccoli', value: 'broccoli', caloriesPerGram: 0.34, servingUnit: 'g' },
  { label: 'Brown Rice', value: 'brown-rice', caloriesPerGram: 1.11, servingUnit: 'g' },
  { label: 'Carrot', value: 'carrot', caloriesPerGram: 0.41, servingUnit: 'g' },
  { label: 'Chicken Breast', value: 'chicken-breast', caloriesPerGram: 1.65, servingUnit: 'g' },
  { label: 'Chicken', value: 'chicken', caloriesPerGram: 1.75, servingUnit: 'g' },
  { label: 'Egg', value: 'egg', caloriesPerGram: 1.55, servingUnit: 'g' },
  { label: 'Oatmeal', value: 'oatmeal', caloriesPerGram: 3.8, servingUnit: 'g' },
  { label: 'Potato', value: 'potato', caloriesPerGram: 0.77, servingUnit: 'g' },
  { label: 'Rice', value: 'rice', caloriesPerGram: 1.3, servingUnit: 'g' },
  { label: 'Salmon', value: 'salmon', caloriesPerGram: 2.08, servingUnit: 'g' },
  { label: 'Sweet Potato', value: 'sweet-potato', caloriesPerGram: 0.86, servingUnit: 'g' },
  { label: 'Tofu', value: 'tofu', caloriesPerGram: 0.76, servingUnit: 'g' },
  { label: 'White Bread', value: 'white-bread', caloriesPerGram: 2.65, servingUnit: 'slice' },
  { label: 'Whole Wheat Bread', value: 'whole-wheat-bread', caloriesPerGram: 2.47, servingUnit: 'slice' },
  { label: 'Avocado', value: 'avocado', caloriesPerGram: 1.6, servingUnit: 'g' },
  { label: 'Spinach', value: 'spinach', caloriesPerGram: 0.23, servingUnit: 'g' },
  { label: 'Almond', value: 'almond', caloriesPerGram: 5.76, servingUnit: 'g' },
  { label: 'Greek Yogurt', value: 'greek-yogurt', caloriesPerGram: 0.59, servingUnit: 'g' },
  { label: 'Peanut Butter', value: 'peanut-butter', caloriesPerGram: 5.88, servingUnit: 'spoon' },
  { label: 'Tuna', value: 'tuna', caloriesPerGram: 1.3, servingUnit: 'g' },
  { label: 'Black Beans', value: 'black-beans', caloriesPerGram: 1.3, servingUnit: 'g' },
  { label: 'Quinoa', value: 'quinoa', caloriesPerGram: 1.2, servingUnit: 'g' },
  { label: 'Lentils', value: 'lentils', caloriesPerGram: 1.16, servingUnit: 'g' },
  { label: 'Blueberries', value: 'blueberries', caloriesPerGram: 0.57, servingUnit: 'g' },
  { label: 'Strawberries', value: 'strawberries', caloriesPerGram: 0.32, servingUnit: 'g' },
  { label: 'Orange', value: 'orange', caloriesPerGram: 0.47, servingUnit: 'g' },
  { label: 'Watermelon', value: 'watermelon', caloriesPerGram: 0.3, servingUnit: 'g' },
  { label: 'Pineapple', value: 'pineapple', caloriesPerGram: 0.5, servingUnit: 'g' },
  { label: 'Grapes', value: 'grapes', caloriesPerGram: 0.69, servingUnit: 'g' },
  { label: 'Kiwi', value: 'kiwi', caloriesPerGram: 0.61, servingUnit: 'g' },
  { label: 'Mango', value: 'mango', caloriesPerGram: 0.6, servingUnit: 'g' },
  { label: 'Pear', value: 'pear', caloriesPerGram: 0.57, servingUnit: 'g' },
  { label: 'Peach', value: 'peach', caloriesPerGram: 0.39, servingUnit: 'g' },
  { label: 'Kale', value: 'kale', caloriesPerGram: 0.49, servingUnit: 'g' },
  { label: 'Cauliflower', value: 'cauliflower', caloriesPerGram: 0.25, servingUnit: 'g' },
  { label: 'Cucumber', value: 'cucumber', caloriesPerGram: 0.15, servingUnit: 'g' },
  { label: 'Bell Pepper', value: 'bell-pepper', caloriesPerGram: 0.31, servingUnit: 'g' },
  { label: 'Zucchini', value: 'zucchini', caloriesPerGram: 0.17, servingUnit: 'g' },
  { label: 'Tomato', value: 'tomato', caloriesPerGram: 0.18, servingUnit: 'g' },
  { label: 'Mushroom', value: 'mushroom', caloriesPerGram: 0.22, servingUnit: 'g' },
  { label: 'Onion', value: 'onion', caloriesPerGram: 0.4, servingUnit: 'g' },
  { label: 'Garlic', value: 'garlic', caloriesPerGram: 1.49, servingUnit: 'g' },
  { label: 'Ginger', value: 'ginger', caloriesPerGram: 0.8, servingUnit: 'g' },
  { label: 'Pork', value: 'pork', caloriesPerGram: 2.42, servingUnit: 'g' },
  { label: 'Turkey', value: 'turkey', caloriesPerGram: 1.89, servingUnit: 'g' },
  { label: 'Lamb', value: 'lamb', caloriesPerGram: 2.94, servingUnit: 'g' },
  { label: 'Shrimp', value: 'shrimp', caloriesPerGram: 0.99, servingUnit: 'g' },
  { label: 'Cod', value: 'cod', caloriesPerGram: 0.82, servingUnit: 'g' },
  { label: 'Tilapia', value: 'tilapia', caloriesPerGram: 1.28, servingUnit: 'g' },
  { label: 'Trout', value: 'trout', caloriesPerGram: 1.9, servingUnit: 'g' },
  { label: 'Sardines', value: 'sardines', caloriesPerGram: 2.08, servingUnit: 'g' },
  { label: 'Crab', value: 'crab', caloriesPerGram: 0.83, servingUnit: 'g' },
  { label: 'Lobster', value: 'lobster', caloriesPerGram: 0.89, servingUnit: 'g' },
  { label: 'Oysters', value: 'oysters', caloriesPerGram: 0.68, servingUnit: 'g' },
  { label: 'Walnuts', value: 'walnuts', caloriesPerGram: 6.54, servingUnit: 'g' },
  { label: 'Pecans', value: 'pecans', caloriesPerGram: 6.87, servingUnit: 'g' },
  { label: 'Cashews', value: 'cashews', caloriesPerGram: 5.53, servingUnit: 'g' },
  { label: 'Pistachios', value: 'pistachios', caloriesPerGram: 5.62, servingUnit: 'g' },
  { label: 'Hazelnuts', value: 'hazelnuts', caloriesPerGram: 6.28, servingUnit: 'g' },
  { label: 'Chia Seeds', value: 'chia-seeds', caloriesPerGram: 4.86, servingUnit: 'spoon' },
  { label: 'Flaxseeds', value: 'flaxseeds', caloriesPerGram: 5.34, servingUnit: 'spoon' },
  { label: 'Hemp Seeds', value: 'hemp-seeds', caloriesPerGram: 5.53, servingUnit: 'spoon' },
  { label: 'Pumpkin Seeds', value: 'pumpkin-seeds', caloriesPerGram: 5.46, servingUnit: 'spoon' },
  { label: 'Sunflower Seeds', value: 'sunflower-seeds', caloriesPerGram: 5.84, servingUnit: 'spoon' },
  { label: 'Chickpeas', value: 'chickpeas', caloriesPerGram: 1.64, servingUnit: 'g' },
  { label: 'Kidney Beans', value: 'kidney-beans', caloriesPerGram: 1.33, servingUnit: 'g' },
  { label: 'Pinto Beans', value: 'pinto-beans', caloriesPerGram: 1.43, servingUnit: 'g' },
  { label: 'Navy Beans', value: 'navy-beans', caloriesPerGram: 1.37, servingUnit: 'g' },
  { label: 'Lima Beans', value: 'lima-beans', caloriesPerGram: 1.15, servingUnit: 'g' },
  { label: 'Green Peas', value: 'green-peas', caloriesPerGram: 0.81, servingUnit: 'g' },
  { label: 'Edamame', value: 'edamame', caloriesPerGram: 1.21, servingUnit: 'g' },
  { label: 'Corn', value: 'corn', caloriesPerGram: 0.86, servingUnit: 'g' },
  { label: 'Asparagus', value: 'asparagus', caloriesPerGram: 0.2, servingUnit: 'g' },
  { label: 'Brussels Sprouts', value: 'brussels-sprouts', caloriesPerGram: 0.43, servingUnit: 'g' },
  { label: 'Cabbage', value: 'cabbage', caloriesPerGram: 0.25, servingUnit: 'g' },
  { label: 'Celery', value: 'celery', caloriesPerGram: 0.16, servingUnit: 'g' },
  { label: 'Eggplant', value: 'eggplant', caloriesPerGram: 0.25, servingUnit: 'g' },
  { label: 'Lettuce', value: 'lettuce', caloriesPerGram: 0.15, servingUnit: 'g' },
  { label: 'Radish', value: 'radish', caloriesPerGram: 0.16, servingUnit: 'g' },
  { label: 'Turnip', value: 'turnip', caloriesPerGram: 0.28, servingUnit: 'g' },
  { label: 'Beets', value: 'beets', caloriesPerGram: 0.43, servingUnit: 'g' },
  { label: 'Pumpkin', value: 'pumpkin', caloriesPerGram: 0.26, servingUnit: 'g' },
  { label: 'Squash', value: 'squash', caloriesPerGram: 0.18, servingUnit: 'g' },
  { label: 'Cottage Cheese', value: 'cottage-cheese', caloriesPerGram: 0.98, servingUnit: 'g' },
  { label: 'Cheddar Cheese', value: 'cheddar-cheese', caloriesPerGram: 4.03, servingUnit: 'g' },
  { label: 'Mozzarella', value: 'mozzarella', caloriesPerGram: 2.8, servingUnit: 'g' },
  { label: 'Parmesan', value: 'parmesan', caloriesPerGram: 4.31, servingUnit: 'g' },
  { label: 'Feta', value: 'feta', caloriesPerGram: 2.64, servingUnit: 'g' },
  { label: 'Goat Cheese', value: 'goat-cheese', caloriesPerGram: 3.64, servingUnit: 'g' },
  { label: 'Milk', value: 'milk', caloriesPerGram: 0.42, servingUnit: 'ml' },
  { label: 'Almond Milk', value: 'almond-milk', caloriesPerGram: 0.15, servingUnit: 'ml' },
  { label: 'Soy Milk', value: 'soy-milk', caloriesPerGram: 0.33, servingUnit: 'ml' },
  { label: 'Coconut Milk', value: 'coconut-milk', caloriesPerGram: 2.3, servingUnit: 'ml' },
  { label: 'Oat Milk', value: 'oat-milk', caloriesPerGram: 0.48, servingUnit: 'ml' },
  { label: 'Olive Oil', value: 'olive-oil', caloriesPerGram: 8.84, servingUnit: 'spoon' },
  { label: 'Coconut Oil', value: 'coconut-oil', caloriesPerGram: 8.92, servingUnit: 'spoon' },
  { label: 'Avocado Oil', value: 'avocado-oil', caloriesPerGram: 8.84, servingUnit: 'spoon' }
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
          { id: 'b1', name: 'Oatmeal', quantity: 100, calories: 380, foodValue: 'oatmeal', servingUnit: 'g' },
          { id: 'b2', name: 'Banana', quantity: 120, calories: 107, foodValue: 'banana', servingUnit: 'g' },
          { id: 'b3', name: 'Almond', quantity: 25, calories: 144, foodValue: 'almond', servingUnit: 'g' },
          { id: 'b4', name: 'Greek Yogurt', quantity: 120, calories: 71, foodValue: 'greek-yogurt', servingUnit: 'g' }
        ]
      },
      { 
        title: 'Lunch', 
        time: "12:00", 
        date: new Date(), 
        calories: 500,
        foodItems: [
          { id: 'l1', name: 'Brown Rice', quantity: 150, calories: 167, foodValue: 'brown-rice', servingUnit: 'g' },
          { id: 'l2', name: 'Chicken Breast', quantity: 120, calories: 198, foodValue: 'chicken-breast', servingUnit: 'g' },
          { id: 'l3', name: 'Broccoli', quantity: 150, calories: 51, foodValue: 'broccoli', servingUnit: 'g' },
          { id: 'l4', name: 'Olive Oil', quantity: 1, calories: 88, foodValue: 'olive-oil', servingUnit: 'spoon' }
        ]
      },
      { 
        title: 'Dinner', 
        time: "19:00", 
        date: new Date(), 
        calories: 800,
        foodItems: [
          { id: 'd1', name: 'Salmon', quantity: 180, calories: 374, foodValue: 'salmon', servingUnit: 'g' },
          { id: 'd2', name: 'Sweet Potato', quantity: 200, calories: 172, foodValue: 'sweet-potato', servingUnit: 'g' },
          { id: 'd3', name: 'Spinach', quantity: 100, calories: 23, foodValue: 'spinach', servingUnit: 'g' },
          { id: 'd4', name: 'Avocado', quantity: 100, calories: 160, foodValue: 'avocado', servingUnit: 'g' },
          { id: 'd5', name: 'Olive Oil', quantity: 1, calories: 71, foodValue: 'olive-oil', servingUnit: 'spoon' }
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
          { id: 'yb1', name: 'Whole Wheat Bread', quantity: 3, calories: 198, foodValue: 'whole-wheat-bread', servingUnit: 'slice' },
          { id: 'yb2', name: 'Egg', quantity: 150, calories: 233, foodValue: 'egg', servingUnit: 'g' },
          { id: 'yb3', name: 'Avocado', quantity: 100, calories: 160, foodValue: 'avocado', servingUnit: 'g' },
          { id: 'yb4', name: 'Tomato', quantity: 100, calories: 18, foodValue: 'tomato', servingUnit: 'g' },
          { id: 'yb5', name: 'Orange', quantity: 200, calories: 94, foodValue: 'orange', servingUnit: 'g' }
        ]
      },
      { 
        title: 'Lunch', 
        time: "12:00", 
        date: new Date(new Date().setDate(new Date().getDate() - 1)), 
        calories: 500, 
        foodItems: [
          { id: 'yl1', name: 'Quinoa', quantity: 150, calories: 180, foodValue: 'quinoa', servingUnit: 'g' },
          { id: 'yl2', name: 'Chickpeas', quantity: 120, calories: 197, foodValue: 'chickpeas', servingUnit: 'g' },
          { id: 'yl3', name: 'Bell Pepper', quantity: 100, calories: 31, foodValue: 'bell-pepper', servingUnit: 'g' },
          { id: 'yl4', name: 'Cucumber', quantity: 100, calories: 15, foodValue: 'cucumber', servingUnit: 'g' },
          { id: 'yl5', name: 'Feta', quantity: 30, calories: 79, foodValue: 'feta', servingUnit: 'g' }
        ]
      },
      { 
        title: 'Dinner', 
        time: "19:00", 
        date: new Date(new Date().setDate(new Date().getDate() - 1)), 
        calories: 800, 
        foodItems: [
          { id: 'yd1', name: 'Chicken', quantity: 200, calories: 350, foodValue: 'chicken', servingUnit: 'g' },
          { id: 'yd2', name: 'Rice', quantity: 150, calories: 195, foodValue: 'rice', servingUnit: 'g' },
          { id: 'yd3', name: 'Carrots', quantity: 100, calories: 41, foodValue: 'carrot', servingUnit: 'g' },
          { id: 'yd4', name: 'Broccoli', quantity: 150, calories: 51, foodValue: 'broccoli', servingUnit: 'g' },
          { id: 'yd5', name: 'Olive Oil', quantity: 2, calories: 159, foodValue: 'olive-oil', servingUnit: 'spoon' }
        ]
      },
      { 
        title: 'Evening Snack', 
        time: "22:00", 
        date: new Date(new Date().setDate(new Date().getDate() - 1)), 
        calories: 300, 
        foodItems: [
          { id: 'ys1', name: 'Greek Yogurt', quantity: 200, calories: 118, foodValue: 'greek-yogurt', servingUnit: 'g' },
          { id: 'ys2', name: 'Blueberries', quantity: 150, calories: 86, foodValue: 'blueberries', servingUnit: 'g' },
          { id: 'ys3', name: 'Walnuts', quantity: 15, calories: 98, foodValue: 'walnuts', servingUnit: 'g' }
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
          { id: 'db1', name: 'Oatmeal', quantity: 100, calories: 380, foodValue: 'oatmeal', servingUnit: 'g' },
          { id: 'db2', name: 'Almond Milk', quantity: 250, calories: 38, foodValue: 'almond-milk', servingUnit: 'ml' },
          { id: 'db3', name: 'Strawberries', quantity: 150, calories: 48, foodValue: 'strawberries', servingUnit: 'g' },
          { id: 'db4', name: 'Peanut Butter', quantity: 4, calories: 235, foodValue: 'peanut-butter', servingUnit: 'spoon' }
        ]
      },
      { 
        title: 'Lunch', 
        time: "14:00", 
        date: new Date("2024-12-03"), 
        calories: 800, 
        foodItems: [
          { id: 'dl1', name: 'Tuna', quantity: 150, calories: 195, foodValue: 'tuna', servingUnit: 'g' },
          { id: 'dl2', name: 'Whole Wheat Bread', quantity: 3, calories: 198, foodValue: 'whole-wheat-bread', servingUnit: 'slice' },
          { id: 'dl3', name: 'Avocado', quantity: 100, calories: 160, foodValue: 'avocado', servingUnit: 'g' },
          { id: 'dl4', name: 'Lettuce', quantity: 50, calories: 8, foodValue: 'lettuce', servingUnit: 'g' },
          { id: 'dl5', name: 'Tomato', quantity: 100, calories: 18, foodValue: 'tomato', servingUnit: 'g' },
          { id: 'dl6', name: 'Apple', quantity: 180, calories: 94, foodValue: 'apple', servingUnit: 'g' },
          { id: 'dl7', name: 'Cashews', quantity: 25, calories: 138, foodValue: 'cashews', servingUnit: 'g' }
        ]
      },
      { 
        title: 'Dinner', 
        time: "18:00", 
        date: new Date("2024-12-03"), 
        calories: 800, 
        foodItems: [
          { id: 'dd1', name: 'Beef', quantity: 150, calories: 375, foodValue: 'beef', servingUnit: 'g' },
          { id: 'dd2', name: 'Potato', quantity: 200, calories: 154, foodValue: 'potato', servingUnit: 'g' },
          { id: 'dd3', name: 'Asparagus', quantity: 150, calories: 30, foodValue: 'asparagus', servingUnit: 'g' },
          { id: 'dd4', name: 'Mushroom', quantity: 100, calories: 22, foodValue: 'mushroom', servingUnit: 'g' },
          { id: 'dd5', name: 'Olive Oil', quantity: 1, calories: 133, foodValue: 'olive-oil', servingUnit: 'spoon' },
          { id: 'dd6', name: 'Parmesan', quantity: 20, calories: 86, foodValue: 'parmesan', servingUnit: 'g' }
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