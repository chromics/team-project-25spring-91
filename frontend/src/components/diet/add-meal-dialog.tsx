import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SearchableCombobox } from '@/components/diet/food-combobox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrashIcon } from 'lucide-react';
import { format } from 'date-fns';
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

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMeal: (meal: { 
    title: string; 
    time: string; 
    date: Date; 
    calories: number;
    foodItems: FoodEntry[];
  }) => void;
  foodItems: FoodItem[];
  enableTitleSuggestions?: boolean;
}

const MAX_WEIGHT = 2000;
const MAX_TITLE_LENGTH = 15;
const MAX_FOOD_ITEMS = 20;

export const AddMealDialog: React.FC<AddMealDialogProps> = ({
  open,
  onOpenChange,
  onAddMeal,
  foodItems,
  enableTitleSuggestions = true,
}) => {
  const [title, setTitle] = useState<string>('');
  const [mealItems, setMealItems] = useState<FoodEntry[]>([]);
  const [selectedFood, setSelectedFood] = useState<string>('');
  const [weight, setWeight] = useState<number>(100);
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
  const [editingWeight, setEditingWeight] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState<number>(0);

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
  const isDuplicateFood = selectedFood && mealItems.some(item => item.foodValue === selectedFood);

  useEffect(() => {
    // Set current date and time when dialog opens
    if (open) {
      setSelectedDateTime(new Date());
    }
  }, [open]);

  useEffect(() => {
    const newTotal = mealItems.reduce((sum, item) => sum + item.calories, 0);
    setTotalCalories(newTotal);
  }, [mealItems]);

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

  const handleWeightDoubleClick = (item: FoodEntry) => {
    setEditingWeight(item.id);
    setEditWeight(item.weight);
  };

  const handleWeightChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= MAX_WEIGHT) {
      setEditWeight(numValue);
    }
  };

  const handleWeightSave = (itemId: string) => {
    if (editWeight < 1) {
      setEditWeight(1);
      return;
    }

    setMealItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const foodItem = sortedFoodItems.find(f => f.value === item.foodValue);
        const newCalories = foodItem ? Math.round(foodItem.caloriesPerGram * editWeight) : item.calories;
        return { ...item, weight: editWeight, calories: newCalories };
      }
      return item;
    }));
    
    setEditingWeight(null);
  };

  const handleWeightCancel = () => {
    setEditingWeight(null);
    setEditWeight(0);
  };

  const handleSubmitMeal = () => {
    if (!title.trim() || mealItems.length === 0) return;
    
    onAddMeal({
      title: title.trim(),
      time: format(selectedDateTime, 'HH:mm'),
      date: selectedDateTime, 
      calories: totalCalories,
      foodItems: mealItems
    });
    
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle('');
    setMealItems([]);
    setSelectedFood('');
    setWeight(100);
    setSelectedDateTime(new Date());
    setEditingWeight(null);
  };

  const handleDialogClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px] h-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Meals</DialogTitle>
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
                        <TableCell>
                          {editingWeight === item.id ? (
                            <div className="flex items-center space-x-1">
                              <Input
                                type="number"
                                value={editWeight || ''}
                                onChange={(e) => handleWeightChange(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleWeightSave(item.id);
                                  } else if (e.key === 'Escape') {
                                    handleWeightCancel();
                                  }
                                }}
                                onBlur={() => handleWeightSave(item.id)}
                                className="w-16 h-6 text-xs"
                                min={1}
                                max={MAX_WEIGHT}
                                autoFocus
                              />
                              <span className="text-xs text-muted-foreground">gr</span>
                            </div>
                          ) : (
                            <span 
                              className="cursor-pointer hover:bg-muted px-1 py-0.5 rounded"
                              onDoubleClick={() => handleWeightDoubleClick(item)}
                              title="Double-click to edit"
                            >
                              {item.weight} gr
                            </span>
                          )}
                        </TableCell>
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
        
        <DialogFooter>
          <Button 
            variant="default" 
            onClick={handleSubmitMeal}
            disabled={!title.trim() || mealItems.length === 0}
            className="w-full sm:w-auto"
          >
            Add Meal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
