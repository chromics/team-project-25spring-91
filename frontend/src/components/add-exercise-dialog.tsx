//add-exercise-dialog
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
import { error } from "console"
import api from "@/utils/api"

interface Exercise {
    exerciseId: number;
    plannedSets: number;
    plannedReps: number;
}

interface ExerciseOption {
    id: string;
    name: string;
    category: string;
}

interface AddExerciseDialogProps {
    propAddExercise: (exercise: Exercise) => void;
}


export function AddExerciseDialog({ propAddExercise }: AddExerciseDialogProps) {
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
    const [reps, setReps] = useState('');
    const [sets, setSets] = useState('');
    const [open, setOpen] = useState(false);
    const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
    useEffect(() => {
        handleFetchExercises();
    }, []);

    const handleSaveExercise = () => {
        try {
            if (!selectedExerciseId || !reps || !sets) {
                toast.error("All fields are required");
                return;
            }

            if (Number(reps) <= 0 || Number(sets) <= 0) {
                toast.error("Reps and sets must be greater than 0");
                return;
            }

            propAddExercise({
                exerciseId: Number(selectedExerciseId),
                plannedReps: Number(reps),
                plannedSets: Number(sets)
            });

            // Reset form
            setSelectedExerciseId('');
            setReps('');
            setSets('');
            setOpen(false);

            toast.success("Exercise added successfully");
        } catch (error) {
            console.error("Error saving exercise:", error);
            toast.error("Failed to add exercise");
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

            const errorMessage = error instanceof Error
                ? error.message
                : 'An unexpected error occurred';

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
                    <DialogTitle>Add Exercise to Workout</DialogTitle>
                    <DialogDescription>
                        Select an exercise and specify sets and reps.
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
                            min="1"
                            placeholder="Number of repetitions"
                        />
                    </div>
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
                            min="1"
                            placeholder="Number of sets"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        onClick={handleSaveExercise}
                    >
                        Add Exercise
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}