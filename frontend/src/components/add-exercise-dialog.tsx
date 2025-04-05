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

interface Exercise {
    name: string,
    reps: number,
    sets: number
}

interface AddExerciseDialogProps {
    propAddExercise: (exercise: Exercise) => void;
}


export function AddExerciseDialog({ propAddExercise }: AddExerciseDialogProps) {
    const [name, setName] = useState('');
    const [reps, setReps] = useState('');
    const [sets, setSets] = useState('');

    const handleSaveExercise = () => {
        try {
            if (!name || !reps || !sets) {
                toast.error("all fields are reqiured");
                return;
            }
            


            propAddExercise({
                name: name,
                reps: Number(reps),
                sets: Number(sets)
            });

        } catch (error) {
            console.error("Error saving exercise:", error);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Add your exercises</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Choose exercises</DialogTitle>
                    <DialogDescription>
                        Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reps" className="text-right">
                            REPS
                        </Label>
                        <Input
                            id="reps"
                            type="number"
                            pattern="[0-9]*"
                            value={reps}
                            onChange={(e) => setReps(e.target.value)}
                            onKeyDown={(e) => {
                                // Prevent non-numeric input
                                const isNumber = /[0-9]/.test(e.key);
                                const isBackspace = e.key === 'Backspace';
                                const isDelete = e.key === 'Delete';
                                const isArrow = e.key.startsWith('Arrow');
                                const isTab = e.key === 'Tab';

                                if (!isNumber && !isBackspace && !isDelete && !isArrow && !isTab) {
                                    e.preventDefault();
                                }
                            }}
                            placeholder="ex: 1000"
                            className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sets" className="text-right">
                            SETS
                        </Label>
                        <Input
                            id="sets"
                            type="number"
                            pattern="[0-9]*"
                            value={sets}
                            onChange={(e) => setSets(e.target.value)}
                            onKeyDown={(e) => {
                                // Prevent non-numeric input
                                const isNumber = /[0-9]/.test(e.key);
                                const isBackspace = e.key === 'Backspace';
                                const isDelete = e.key === 'Delete';
                                const isArrow = e.key.startsWith('Arrow');
                                const isTab = e.key === 'Tab';

                                if (!isNumber && !isBackspace && !isDelete && !isArrow && !isTab) {
                                    e.preventDefault();
                                }
                            }}
                            placeholder="ex: 1000"
                            className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleSaveExercise}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
