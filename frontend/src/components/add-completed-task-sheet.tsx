// Modified version of your add-completed-task-sheet.tsx
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
import { AddCompletedExerciseDialog } from "./add-completed-exercise-dialog"
import { AArrowDown, Plus } from "lucide-react"
import api from "@/utils/api"
import axios from "axios"

interface CompletedExercise {
    exerciseId: number;
    actualSets: number | null;
    actualReps: number | null;
    actualDuration: number | null;
}

interface ExerciseOption {
    id: number;
    name: string;
    category: string;
}

interface AddCompletedTaskSheetProps {
    propAddCompletedTasks: () => void;
}

export function AddCompletedTaskSheet({ propAddCompletedTasks }: AddCompletedTaskSheetProps) {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [isLoading, setIsLoading] = React.useState(false);
    const [title, setTitle] = React.useState('');
    const [exercises, setExercises] = React.useState<CompletedExercise[]>([]);
    const [exerciseOptions, setExerciseOptions] = React.useState<ExerciseOption[]>([]);

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
            const { data } = await api.get('/exercises'); 
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

    const handleAddExercise = (newExercise: CompletedExercise) => {
        setExercises([...exercises, newExercise]);
    }

    const handleAddCompletedWorkout = async () => {
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
                completedDate: date.toISOString().split('T')[0],
                exercises: exercises.map(ex => ({
                    exerciseId: ex.exerciseId,
                    actualSets: ex.actualSets,
                    actualReps: ex.actualReps,
                    actualDuration: ex.actualDuration
                }))
            };

            // const response = await fetch("http://localhost:5000/api/actual-workouts", {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`,
            //     },
            //     body: JSON.stringify(workoutData),
            // });

            // const responseText = await response.text();

            // if (!response.ok) {
            //     let errorMessage = "Failed to add completed workout";
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
            const { data } = await api.post('/actual-workouts', workoutData); 
            propAddCompletedTasks();
            toast.success(data.message || "Workout completed successfully");
            setOpen(false);
            resetForm();

            {/**
            * AI generated code 
             tool: chat-gpt 
             version: o3 mini high
             usage: typescript is a bit strict with type, i use it to correct the syntax and more robust error checking  
            */}
        } catch (error: unknown) {
            let errorMessage = 'Failed to add workout';

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
                        <SheetTitle>Add Completed Workout</SheetTitle>
                        <SheetDescription>
                            Record your completed workout details.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-6 pb-8 py-1">
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            await handleAddCompletedWorkout();
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
                                        placeholder="ex: Morning Workout"
                                        className="col-span-3"
                                    />
                                </div>

                                <AddCompletedExerciseDialog propAddExercise={handleAddExercise} />

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
                                                        {exercise.actualReps !== null && exercise.actualSets !== null && (
                                                            <>
                                                                <span className="text-sm text-gray-600">
                                                                    {exercise.actualReps} reps
                                                                </span>
                                                                <span className="text-sm text-gray-600">
                                                                    {exercise.actualSets} sets
                                                                </span>
                                                            </>
                                                        )}
                                                        {exercise.actualDuration !== null && (
                                                            <span className="text-sm text-gray-600">
                                                                {exercise.actualDuration} min
                                                            </span>
                                                        )}
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
                            onClick={handleAddCompletedWorkout}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? "Adding..." : "Add Completed Workout"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}