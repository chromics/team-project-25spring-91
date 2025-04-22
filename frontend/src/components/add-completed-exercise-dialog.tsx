// add-completed-exercise-dialog.tsx
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import api from "@/utils/api"
import axios from "axios"

interface CompletedExercise {
    exerciseId: number;
    actualSets: number;
    actualReps: number;
    actualDuration: number;
}

interface AddCompletedExerciseDialogProps {
    propAddExercise: (exercise: CompletedExercise) => void;
}

interface ExerciseOption {
    id: string;
    name: string;
    category: string;
}

export function AddCompletedExerciseDialog({ propAddExercise }: AddCompletedExerciseDialogProps) {
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
    const [reps, setReps] = useState('0');
    const [sets, setSets] = useState('0');
    const [duration, setDuration] = useState('0');
    const [open, setOpen] = useState(false);
    const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
    useEffect(() => {
        handleFetchExercises();
    }, []);


    const handleSaveExercise = () => {
        try {
            if (!selectedExerciseId) {
                toast.error("Please select an exercise");
                return;
            }

            // Convert all values to numbers, defaulting to 0 if empty
            const actualReps = Number(reps) || 0;
            const actualSets = Number(sets) || 0;
            const actualDuration = Number(duration) || 0;

            propAddExercise({
                exerciseId: Number(selectedExerciseId),
                actualReps,
                actualSets,
                actualDuration
            });

            // Reset form
            setSelectedExerciseId('');
            setReps('0');
            setSets('0');
            setDuration('0');
            setOpen(false);

            
        } catch (error) {
            console.error("Error saving workout:", error);
            let errorMessage = 'Failed to add exercises';

            if (axios.isAxiosError(error) && error.response && error.response.data) {

                errorMessage = error.response.data.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        }
    }

    const handleFetchExercises = async () => {
        try {
            // const token = localStorage.getItem('auth-token');

            // if (!token) {
            //     toast.error("Authentication token not found. Please login again.");
            //     return;
            // }
            // const response = await fetch('http://localhost:5000/api/exercises', {
            //     method: 'GET',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`,
            //     },
            // });
            // if (!response.ok) {
            //     throw new Error("cannot fetch exercises");
            // }
            // const data = await response.json();
            const { data } = await api.get('/exercises');
            const options = data.data.map((exercise: any) => ({
                id: exercise.id.toString(),
                name: exercise.name,
                category: exercise.category
            }));
            setExerciseOptions(options);

        } catch (error: unknown) {
            console.error('Error details:', error);

            let errorMessage = 'Failed to load exercises';

            if (axios.isAxiosError(error) && error.response && error.response.data) {

                errorMessage = error.response.data.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        }
    }

    const getExerciseName = (id: string): string => {
        for (const exercise of exerciseOptions) {
            if (exercise.id.toString() === id) {
                return exercise.name;
            }
        }
        return '';
    }
    /**
     * AI generated code 
     * tool: chat-gpt 
     * version: o3 mini high
     * usage: because of the json struture from backend is a bit linear, i use to AI to help me group the exercises by category first before map it to frontend    
     */
    const groupExercisesByCategory = (exercises: ExerciseOption[]) => {
        const groups: Record<string, ExerciseOption[]> = {};

        exercises.forEach(exercise => {
            if (!groups[exercise.category]) {
                groups[exercise.category] = [];
            }
            groups[exercise.category].push(exercise);
        });

        return groups;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Add Exercise</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Completed Exercise</DialogTitle>
                    <DialogDescription>
                        Enter exercise details. Use 0 for any fields that don't apply.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="exercise" className="text-right">
                            Exercise
                        </Label>
                        <Select
                            value={selectedExerciseId}
                            onValueChange={setSelectedExerciseId}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select an exercise">
                                    {selectedExerciseId && getExerciseName(selectedExerciseId)}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {/**
                                * AI generated code 
                                * tool: chat-gpt 
                                * version: o3 mini high
                                * usage: the mapping is a bit complex, i need some help to correct the tsx syntax 
                                 */}
                                {Object.entries(groupExercisesByCategory(exerciseOptions)).map(([category, exercises]) => (
                                    <SelectGroup key={category}>
                                        <SelectLabel className="capitalize">
                                            {category}
                                        </SelectLabel>
                                        {exercises.map((exercise) => (
                                            <SelectItem
                                                key={exercise.id}
                                                value={exercise.id}
                                            >
                                                {exercise.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedExerciseId && (
                        <>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="sets" className="text-right">
                                    Sets
                                </Label>
                                <Input
                                    id="sets"
                                    type="number"
                                    value={sets}
                                    onChange={(e) => setSets(e.target.value)}
                                    className="col-span-3"
                                    min="0"
                                    placeholder="Number of sets"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="reps" className="text-right">
                                    Reps
                                </Label>
                                <Input
                                    id="reps"
                                    type="number"
                                    value={reps}
                                    onChange={(e) => setReps(e.target.value)}
                                    className="col-span-3"
                                    min="0"
                                    placeholder="Number of repetitions"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="duration" className="text-right">
                                    Duration (min)
                                </Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="col-span-3"
                                    min="0"
                                    placeholder="Duration in minutes"
                                />
                            </div>
                        </>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        onClick={handleSaveExercise}
                        disabled={!selectedExerciseId}
                    >
                        Add Exercise
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}