
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Calendar } from "./ui/calendar"
import { toast } from "sonner"
import React from "react"
import { AddExerciseDialog } from "./add-exercise-dialog"

interface Goal {
    date: string;
    calories: number;
    title: string;
}

interface Exercise {
    name: string,
    reps: number,
    sets: number
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

    const url = "http://localhost:5000";
    const maxCalories = 3000;
    const minCalories = 0;
    const sheetCloseRef = React.useRef<HTMLButtonElement>(null);

    const handleAddExercise = (newExercise: Exercise) => {
        setExercises([...exercises, newExercise]);
    }

    const handleAddGoal = async () => {
        if (!calories) {
            toast.error("Blank input", {
                description: "Please fill in the calories"
            });
            return;
        }
        if (!date) {
            console.log("the date does not exist");
            return;
        }
        if (!title) {
            toast.error("Please input the name of the title");
            return;
        }
        if (Number(calories) < minCalories || Number(calories) > maxCalories) {
            toast.error(`the calories should be between ${minCalories} and ${maxCalories}`);
            return;
        }
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${url}/planned-workouts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    date: date.toISOString(), //convert date to string format
                    calories: Number(calories),
                    title: String(title),
                    estimatedDuration: 60,
                    plannedExercises: exercises,
                }),
            });
            if (!response.ok) {
                toast.error("fail to add");
                throw new Error("fail to add");
            }

            propAddGoal({
                date: date.toISOString(),
                calories: Number(calories),
                title: String(title)
            })

            // get message from backend
            const data = await response.json();
            toast.success(data.message);
            // sheetCloseRef.current?.click();
            setOpen(false);
            // Reset form
            setTitle('');
            setCalories('');
            setExercises([]);
            setDate(new Date());

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 mt-2 w-8 h-8 rounded-full">+</Button>
            </SheetTrigger>
            <SheetContent>
                <div className="flex flex-col h-full">
                    <SheetHeader className="mb-6">
                        <SheetTitle>Add calorie goal</SheetTitle>
                        <SheetDescription>
                            Click add when you're done.
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
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                                        placeholder="ex: Leg day"
                                        className="col-span-3"
                                    />
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="calories" className="text-right">
                                        Calorie
                                    </Label>
                                    <Input
                                        id="calories"
                                        type="number"
                                        pattern="[0-9]*"
                                        value={calories}
                                        onChange={(e) => setCalories(e.target.value)}
                                        onKeyDown={(e) => {
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
                                        className="col-span-3"
                                    />
                                </div>

                                <AddExerciseDialog propAddExercise={handleAddExercise} />

                                {exercises.length > 0 && (
                                    <ul className="space-y-3">
                                        {exercises.map((exercise, index) => (
                                            <li
                                                key={index}
                                                className="p-2 rounded-lg border shadow-sm"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium flex-1">{exercise.name}</p>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm text-gray-600">{exercise.reps} reps</span>
                                                        <span className="text-sm text-gray-600">{exercise.sets} sets</span>
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
                                        onSelect={(selectedDate: Date | undefined) => {
                                            setDate(selectedDate)
                                            console.log("the selected date is: " + selectedDate)
                                        }}
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
                            {isLoading ? "Adding..." : "ADD GOAL"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
