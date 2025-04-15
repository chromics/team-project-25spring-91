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

interface CompletedExercise {
    exerciseId: number;
    actualSets: number;  // Remove null
    actualReps: number;  // Remove null
    actualDuration: number;  // Remove null
}

interface AddCompletedExerciseDialogProps {
    propAddExercise: (exercise: CompletedExercise) => void;
}

const exerciseOptions = [
    {
        category: "Strength",
        exercises: [
            { id: 1, name: "Bench Press", type: "reps" },
            { id: 2, name: "Squats", type: "reps" },
            { id: 3, name: "Deadlift", type: "reps" },
            { id: 4, name: "Overhead Press", type: "reps" }
        ]
    },
    {
        category: "Cardio",
        exercises: [
            { id: 5, name: "Running", type: "duration" },
            { id: 6, name: "Cycling", type: "duration" },
            { id: 7, name: "Jump Rope", type: "duration" },
            { id: 8, name: "Swimming", type: "duration" }
        ]
    }
    // ... rest of your exercise options
];

export function AddCompletedExerciseDialog({ propAddExercise }: AddCompletedExerciseDialogProps) {
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
    const [reps, setReps] = useState('0');
    const [sets, setSets] = useState('0');
    const [duration, setDuration] = useState('0');
    const [open, setOpen] = useState(false);

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
            
            toast.success("Exercise added successfully");
        } catch (error) {
            console.error("Error saving exercise:", error);
            toast.error("Failed to add exercise");
        }
    }

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
                                {exerciseOptions.map((group) => (
                                    <SelectGroup key={group.category}>
                                        <SelectLabel>{group.category}</SelectLabel>
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