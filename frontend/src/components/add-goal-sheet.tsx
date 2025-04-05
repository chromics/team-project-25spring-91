
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

interface Goal{
    date: string;
    calories: number;
}

interface SheetDemoProps {
    propAddGoal: (goal: Goal) => void; 
}

export function SheetDemo({ propAddGoal } : SheetDemoProps) {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [calories, setCalories] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const url = "";
    const maxCalories = 3000;
    const sheetCloseRef = React.useRef<HTMLButtonElement>(null);

    const handleAddGoal = async () => {
        if (!calories) {
            toast.error("Blank input", {
                description:"Please fill in the calories"
            });
            return; 
        }
        if (!date) {
            console.log("the date does not exist");
            return;
        }
        if (Number(calories) < 0 || Number(calories) > maxCalories) {
            toast.error(`the calories should be between 0 and ${maxCalories}`);
            return;
        }
        try {
            setIsLoading(true);
            const response = await fetch(`${url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: date.toISOString(), //convert date to string format
                    calories: Number(calories)
                }),
            });
            if (!response.ok) {
                toast.error("fail to add");
                throw new Error("fail to add");
            }
            
            propAddGoal({
                date: date.toISOString(),
                calories: Number(calories)
            })

            // get message from backend
            const data = await response.json();
            toast.success(data.message);
            // sheetCloseRef.current?.click();
            setOpen(false);

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
                <SheetHeader>
                    <SheetTitle>Add calorie goal</SheetTitle>
                    <SheetDescription>
                        Click add when you're done.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    await handleAddGoal();
                }}>
                    <div className="flex gap-8 py-4 flex-col items-center">

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
                        {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" value="@peduarte" className="col-span-3" />
          </div> */}
                        <div>
                            <Calendar
                                mode="single"
                                selected={date}
                                // onSelect={setDate}
                                onSelect={(selectedDate: Date | undefined) => {
                                    setDate(selectedDate)
                                    console.log("the selected date is: " + selectedDate)
                                }}
                                className="rounded-md border shadow"
                            />
                        </div>


                    </div>
                    <SheetFooter>
                        {/* <SheetClose ref={sheetCloseRef}> */}
                            <Button
                                className="m-5"
                                type="submit"
                                disabled={isLoading}
                            // onClick={handleAddGoal}
                            >
                                {isLoading ? "Adding..." : "ADD GOAL"}
                            </Button>
                        {/* </SheetClose> */}
                    </SheetFooter>
                </form>

            </SheetContent>
        </Sheet >
    )
}
