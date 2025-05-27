import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SearchableCombobox } from '@/components/diet/food-combobox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash, TrashIcon, ArrowLeft } from 'lucide-react';
import DateTimePicker from './date-time-picker';
import { TitleInputWithSuggestions } from './title-input-with-suggestions';

interface FoodItem {
  label: string;
  value: string;
  caloriesPerGram: number;
}

interface FoodEntry {
  id: string;
  name: string;
  weight: number;
  calories: number;
  foodValue: string; 
}

interface Meal {
  title: string;
  time: string;
  date: Date;
  calories: number;
  foodItems?: FoodEntry[];
}

interface MealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: Meal | null;
  onDeleteMeal: (meal: Meal) => void;
  onUpdateMeal: (oldMeal: Meal, updatedMeal: Meal) => void;
  foodItems: FoodItem[];
  enableTitleSuggestions?: boolean;
}

const MAX_WEIGHT = 2000;
const MAX_TITLE_LENGTH = 15;
const MAX_FOOD_ITEMS = 20;

export const ViewEditMealDialog: React.FC<MealDialogProps> = ({
  open,
  onOpenChange,
  meal,
  onDeleteMeal,
  onUpdateMeal,
  foodItems,
  enableTitleSuggestions = true,
}) => {
  const [activeTab, setActiveTab] = useState<string>("view");
  const [title, setTitle] = useState<string>("");
  const [mealItems, setMealItems] = useState<FoodEntry[]>([]);
  const [selectedFood, setSelectedFood] = useState<string>('');
  const [weight, setWeight] = useState<number>(100);
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());

  const sortedFoodItems = [...foodItems].sort((a, b) => 
    a.label.localeCompare(b.label)
  );

  // Filter out already added foods
  const availableFoodItems = sortedFoodItems.filter(item => 
    !mealItems.some(mealItem => mealItem.foodValue === item.value)
  );

  const comboboxItems = availableFoodItems.map(item => ({
    label: item.label,
    value: item.value
  }));

  const isAtFoodLimit = mealItems.length >= MAX_FOOD_ITEMS;
  const isDuplicateFood = Boolean(selectedFood) && mealItems.some(item => item.foodValue === selectedFood);

  // Reset form when dialog opens or meal changes
  useEffect(() => {
    if (open && meal) {
      setActiveTab("view");
      setTitle(meal.title);
      setMealItems(meal.foodItems || []);
      setSelectedDateTime(meal.date);
    }
  }, [open, meal]);

  // Calculate total calories when mealItems changes
  useEffect(() => {
    const newTotal = mealItems.reduce((sum, item) => sum + item.calories, 0);
    setTotalCalories(newTotal);
  }, [mealItems]);

  if (!meal) return null;

  // Format date to match the image format
  const formattedDate = format(meal.date, 'd MMM yyyy');


  const displayFoodItems = useMemo(() => meal.foodItems || [], [meal.foodItems]);
  useEffect(() => {
    if (open && meal) {
      const calculatedTotal = meal.foodItems 
        ? meal.foodItems.reduce((sum, item) => sum + item.calories, 0)
        : meal.calories || 0;
      setTotalCalories(calculatedTotal);
    }
  }, [open, meal]);
  
  const handleDelete = () => {
    onDeleteMeal(meal);
    onOpenChange(false);
  };
  
  const handleEdit = () => {
    setActiveTab("edit");
  };
  
  const handleBack = () => {
    setActiveTab("view");
    // Reset form to original meal data
    setTitle(meal.title);
    setMealItems(meal.foodItems || []);
    setSelectedDateTime(meal.date);
  };

  const handleAddFoodItem = () => {
    if (!selectedFood || weight <= 0 || weight > MAX_WEIGHT || isAtFoodLimit || isDuplicateFood) return;
    
    const foodItem = sortedFoodItems.find(item => item.value === selectedFood);
    if (!foodItem) return;
    
    const calories = Math.round(foodItem.caloriesPerGram * weight);
    
    setMealItems(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: foodItem.label,
        weight,
        calories,
        foodValue: foodItem.value
      }
    ]);
    
    setSelectedFood('');
    setWeight(100);
  };

  const handleRemoveFoodItem = (id: string) => {
    setMealItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmitMeal = () => {
    if (!title.trim() || mealItems.length === 0) return;
    
    const updatedMeal: Meal = {
      title: title.trim(),
      time: format(selectedDateTime, 'HH:mm'),
      date: selectedDateTime,
      calories: totalCalories,
      foodItems: mealItems
    };
    
    onUpdateMeal(meal, updatedMeal);
    setActiveTab("view");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-auto">
        <Tabs value={activeTab} className="w-full">
          {/* View Tab */}
          <TabsContent value="view" className="mt-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{meal.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-2">
              <div className="text-sm text-muted-foreground">
                {formattedDate} {meal.time}
              </div>
              
              <div className="border rounded-md h-[300px]">
                <ScrollArea className="h-[300px] w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Meal</TableHead>
                        <TableHead className="w-[100px]">Weight</TableHead>
                        <TableHead className="w-[100px]">Calories</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayFoodItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                            No food items recorded
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayFoodItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.weight} gr</TableCell>
                            <TableCell>{item.calories}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              
              <div className="text-sm font-medium">
                Total calories: {totalCalories}
              </div>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0 mt-6">
              <div className="flex w-full justify-between">
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="px-4"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleEdit}
                  className="px-4"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </DialogFooter>
          </TabsContent>
          
          {/* Edit Tab */}
          <TabsContent value="edit" className="mt-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-2 h-8 w-8"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                Edit Meal
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-5 pt-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="meal-title">Title</Label>
                  <TitleInputWithSuggestions
                    value={title}
                    onChange={setTitle}
                    maxLength={MAX_TITLE_LENGTH}
                    placeholder="Meal name"
                    enableSuggestions={enableTitleSuggestions}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meal-time">Date & Time</Label>
                  <DateTimePicker 
                    value={selectedDateTime}
                    onChange={setSelectedDateTime}
                  />
                </div>
              </div>
              
              <div className={`text-sm ${isAtFoodLimit ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                Meals ({mealItems.length}/{MAX_FOOD_ITEMS})
                {isAtFoodLimit && ' - Maximum limit reached'}
              </div>

              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <SearchableCombobox
                    items={comboboxItems}
                    value={selectedFood}
                    onValueChange={setSelectedFood}
                    placeholder={isAtFoodLimit ? "Limit reached" : availableFoodItems.length === 0 ? "All foods added" : "Search food..."}
                    emptyText="No food found"
                  />
                </div>
                <div className="col-span-4 flex items-center space-x-1">
                  <Input
                    type="number"
                    value={weight || ''}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setWeight(0);
                      } else {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 0 && val <= MAX_WEIGHT) {
                          setWeight(val);
                        }
                      }
                    }}
                    onBlur={() => {
                      if (weight < 1) {
                        setWeight(1);
                      }
                    }}
                    min={1}
                    max={MAX_WEIGHT}
                    className="w-full"
                    disabled={isAtFoodLimit}
                  />
                  <span className="text-sm text-muted-foreground mr-2">gram</span>
                </div>
                <div className="col-span-3">
                  <Button 
                    onClick={handleAddFoodItem}
                    disabled={!selectedFood || weight <= 0 || isAtFoodLimit || isDuplicateFood}
                    className="w-full"
                  >
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md h-[200px]">
                <ScrollArea className="h-[200px] w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Meal</TableHead>
                        <TableHead className="w-[100px]">Weight</TableHead>
                        <TableHead className="w-[100px]">Calories</TableHead>
                        <TableHead className="w-[40px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mealItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                            No items added yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        mealItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.weight} gr</TableCell>
                            <TableCell>{item.calories}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveFoodItem(item.id)}
                                className="h-7 w-7"
                              >
                                <TrashIcon size={16} className="text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              
              <div className="text-sm font-medium">
                Total calories: {totalCalories}
              </div>
            </div>
            
            <DialogFooter className="flex justify-between w-full gap-4 mt-6">
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                className="px-4"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
              
              <Button 
                variant="default" 
                onClick={handleSubmitMeal}
                disabled={!title.trim() || mealItems.length === 0}
                className="px-4"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
