// add-goal-sheet
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Calendar } from "./ui/calendar"
import { toast } from "sonner"
import React, { useEffect } from "react"
import { AddExerciseDialog } from "./add-exercise-dialog"
import { Plus, Trash2 } from "lucide-react"
import api from "@/utils/api"
import axios from "axios"

interface Exercise {
    exerciseId: number;
    plannedSets: number;
    plannedReps: number;
}

interface Goal {
    date: string;
    calories: number;
    title: string;
}

interface ExerciseOption {
    id: number;
    name: string;
    category: string;
}

interface SheetDemoProps {
    propAddGoal: (goal: Goal) => void;
}

export function SheetDemo({ propAddGoal }: SheetDemoProps) {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [calories, setCalories] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [title, setTitle] = React.useState('');
    const [exercises, setExercises] = React.useState<Exercise[]>([]);
    const [exerciseOptions, setExerciseOptions] = React.useState<ExerciseOption[]>([]);

    const maxCalories = 3000;
    const minCalories = 0;

    useEffect(() => {
        if (open) {
            handleFetchExercises();
        }
    }, [open]);

    const handleFetchExercises = async () => {
        try {
            // const token = localStorage.getItem('auth-token');
            // if (!token) {
            //     toast.error("Authentication token not found");
            //     return;
            // }

            // const response = await fetch('http://localhost:5000/api/exercises', {
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //     }
            // });
            // const data = await response.json();
            const { data } = await api.get('exercises');
            setExerciseOptions(data.data);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            let errorMessage = 'Failed to load exercises';

            if (axios.isAxiosError(error) && error.response && error.response.data) {

                errorMessage = error.response.data.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        }
    };

    const handleAddExercise = (newExercise: Exercise) => {
        const duplicated = exercises.find((exercise) => exercise.exerciseId === newExercise.exerciseId);
        if (duplicated) {
            let exerciseName = '';
            exerciseOptions.forEach(exerciseOption => {
                if (exerciseOption.id === newExercise.exerciseId) {
                    exerciseName = exerciseOption.name;
                }
            });
            toast.error(`${exerciseName} was already added`, {
                description: 'Please choose a new exercise',
            });
            return;
        }
        setExercises([...exercises, newExercise]);
        toast.success("Exercise added successfully");
    }

    const handleDeleteExercise = (id: number) => {
        const updatedExercises = exercises.filter(exercise => exercise.exerciseId !== id);
        setExercises(updatedExercises);
    }

    const handleAddGoal = async () => {
        if (!title.trim()) {
            toast.error("Please enter a workout title");
            return;
        }
        if (!date) {
            toast.error("Please select a date");
            return;
        }
        if (exercises.length === 0) {
            toast.error("Please add at least one exercise");
            return;
        }

        try {
            setIsLoading(true);
            // const token = localStorage.getItem('auth-token');

            // if (!token) {
            //     toast.error("Authentication token not found. Please login again.");
            //     return;
            // }

            const workoutData = {
                title: title.trim(),
                scheduledDate: date.toISOString().split('T')[0],
                estimatedDuration: 60,
                targetCalories: calories ? parseInt(calories) : null,
                exercises: exercises.map(ex => ({
                    exerciseId: ex.exerciseId,
                    plannedSets: ex.plannedSets,
                    plannedReps: ex.plannedReps
                }))
            };

            // const response = await fetch("http://localhost:5000/api/planned-workouts", {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`,
            //     },
            //     body: JSON.stringify(workoutData),
            // });

            // const responseText = await response.text();

            // if (!response.ok) {
            //     let errorMessage = "Failed to add workout";
            //     try {
            //         const errorData = JSON.parse(responseText);
            //         errorMessage = Array.isArray(errorData.error)
            //             ? errorData.error.map((err: any) => err.message).join('\n')
            //             : errorData.message || errorData.error || errorMessage;
            //     } catch {
            //         errorMessage = responseText || errorMessage;
            //     }
            //     throw new Error(errorMessage);
            // }

            // const data = JSON.parse(responseText);
            const { data } = await api.post('planned-workouts', workoutData);

            propAddGoal({
                date: date.toISOString(),
                calories: Number(calories) || 0,
                title: title
            });

            toast.success(data.message || "Workout planned successfully");
            setOpen(false);
            resetForm();

        } catch (error: unknown) {
            let errorMessage = 'Failed to add workout plan';

            if (axios.isAxiosError(error) && error.response && error.response.data) {

                errorMessage = error.response.data.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    const resetForm = () => {
        setTitle('');
        setCalories('');
        setExercises([]);
        setDate(new Date());
    }

    const getExerciseName = (exerciseId: number): string => {
        const exercise = exerciseOptions.find(ex => ex.id === exerciseId);
        return exercise?.name || "Unknown Exercise";
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full flex items-center justify-center py-6 px-20 my-2 rounded-lg "
                >
                    <Plus className="h-6 w-6" />
                    <span className="ml-2">Add New Workout Plan</span>
                </Button>
            </SheetTrigger>
            <SheetContent>
                <div className="flex flex-col h-full">
                    <SheetHeader className="mb-6">
                        <SheetTitle>Add Workout Plan</SheetTitle>
                        <SheetDescription>
                            Create a new workout plan with exercises.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-6 pb-8 py-1">
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            await handleAddGoal();
                        }}>
                            <div className="space-y-8">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="exercise-title" className="text-right">
                                        Title
                                    </Label>
                                    <Input
                                        id="exercise-title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="ex: Leg day"
                                        className="col-span-3"
                                    />
                                </div>

                                {/* <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="calories" className="text-right">
                                        Calorie
                                    </Label>
                                    <Input
                                        id="calories"
                                        type="number"
                                        value={calories}
                                        onChange={(e) => setCalories(e.target.value)}
                                        placeholder="ex: 1000"
                                        className="col-span-3"
                                        min={minCalories}
                                        max={maxCalories}
                                    />
                                </div> */}

                                <AddExerciseDialog propAddExercise={handleAddExercise} />

                                {exercises.length > 0 && (
                                    <ul className="space-y-3">
                                        {exercises.map((exercise, index) => (
                                            <li
                                                key={index}
                                                className="p-2 rounded-lg border shadow-sm"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium flex-1">
                                                        {getExerciseName(exercise.exerciseId)}
                                                    </p>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm text-gray-600">
                                                            {exercise.plannedReps} reps
                                                        </span>
                                                        <span className="text-sm text-gray-600">
                                                            {exercise.plannedSets} sets
                                                        </span>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            type="button"
                                                            onClick={() => handleDeleteExercise(exercise.exerciseId)}
                                                            aria-label="Delete workout"
                                                            className="cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className="flex justify-center">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        className="rounded-md border shadow"
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="sticky bottom-0 border-t bg-background px-6 py-4 mt-auto">
                        <Button
                            onClick={handleAddGoal}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? "Adding..." : "Add Workout Plan"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}