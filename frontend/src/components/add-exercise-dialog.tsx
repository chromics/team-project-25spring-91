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
import { useState } from "react"
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

interface Exercise {
    exerciseId: number;
    plannedSets: number;
    plannedReps: number;
}

interface AddExerciseDialogProps {
    propAddExercise: (exercise: Exercise) => void;
}

// Updated exercise options with IDs
const exerciseOptions = [
    {
        category: "Strength",
        exercises: [
            { id: 1, name: "Bench Press" },
            { id: 2, name: "Squats" },
            { id: 3, name: "Deadlift" },
            { id: 4, name: "Overhead Press" }
        ]
    },
    {
        category: "Cardio",
        exercises: [
            { id: 5, name: "Running" },
            { id: 6, name: "Cycling" },
            { id: 7, name: "Jump Rope" },
            { id: 8, name: "Swimming" }
        ]
    },
    {
        category: "Flexibility",
        exercises: [
            { id: 9, name: "Yoga" },
            { id: 10, name: "Stretching" },
            { id: 11, name: "Pilates" }
        ]
    },
    {
        category: "Bodyweight",
        exercises: [
            { id: 12, name: "Push-ups" },
            { id: 13, name: "Pull-ups" },
            { id: 14, name: "Dips" },
            { id: 15, name: "Planks" }
        ]
    }
];

export function AddExerciseDialog({ propAddExercise }: AddExerciseDialogProps) {
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
    const [reps, setReps] = useState('');
    const [sets, setSets] = useState('');
    const [open, setOpen] = useState(false);

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

    // Helper function to find exercise name by ID
    const getExerciseName = (id: string): string => {
        for (const category of exerciseOptions) {
            const exercise = category.exercises.find(e => e.id.toString() === id);
            if (exercise) return exercise.name;
        }
        return '';
    }

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
                                {exerciseOptions.map((group) => (
                                    <SelectGroup key={group.category}>
                                        <SelectLabel className="capitalize">
                                            {group.category}
                                        </SelectLabel>
                                        {group.exercises.map((exercise) => (
                                            <SelectItem
                                                key={exercise.id}
                                                value={exercise.id.toString()}
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