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
import React from "react"
import { AddCompletedExerciseDialog } from "./add-completed-exercise-dialog"

interface CompletedExercise {
    exerciseId: number;
    actualSets: number | null;
    actualReps: number | null;
    actualDuration: number | null;
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
            const token = localStorage.getItem('auth-token');
    
            if (!token) {
                toast.error("Authentication token not found. Please login again.");
                return;
            }
    
            const workoutData = {
                title: title.trim(),
                completedDate: date.toISOString().split('T')[0],
                exercises: exercises.map(ex => ({  // Changed from actualExercises to exercises
                    exerciseId: ex.exerciseId,
                    actualSets: ex.actualSets,
                    actualReps: ex.actualReps,
                    actualDuration: ex.actualDuration
                }))
            };
    
            console.log('Sending workout data:', JSON.stringify(workoutData, null, 2));
    
            const response = await fetch("http://localhost:5000/api/actual-workouts", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(workoutData),
            });
    
            const responseText = await response.text();
            console.log('Response:', responseText);
    
            interface ErrorResponse {
                status?: string;
                message?: string;
                error?: Array<{ path: string; message: string }> | string;
            }
    
            let data: ErrorResponse;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                throw new Error('Invalid response format from server');
            }
    
            if (!response.ok) {
                let errorMessage = 'Failed to add completed workout';
                
                if (data.error) {
                    if (Array.isArray(data.error)) {
                        errorMessage = data.error
                            .map(err => err.message)
                            .join('\n');
                    } else if (typeof data.error === 'string') {
                        errorMessage = data.error;
                    }
                } else if (data.message) {
                    errorMessage = data.message;
                }
                
                throw new Error(errorMessage);
            }
    
            propAddCompletedTasks();
            toast.success(data.message || "Workout completed successfully");
            setOpen(false);
            resetForm();
    
        } catch (error: unknown) {
            console.error('Error details:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'An unexpected error occurred';
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
        const exerciseMap: { [key: number]: string } = {
            1: "Bench Press",
            2: "Squats",
            3: "Deadlift",
            4: "Overhead Press",
            5: "Running",
            6: "Cycling",
            7: "Jump Rope",
            8: "Swimming",
            // ... add all exercises here
        };
        return exerciseMap[exerciseId] || "Unknown Exercise";
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 mt-2 w-8 h-8 rounded-full">+</Button>
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
                                                        {exercise.actualReps && exercise.actualSets && (
                                                            <>
                                                                <span className="text-sm text-gray-600">
                                                                    {exercise.actualReps} reps
                                                                </span>
                                                                <span className="text-sm text-gray-600">
                                                                    {exercise.actualSets} sets
                                                                </span>
                                                            </>
                                                        )}
                                                        {exercise.actualDuration && (
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