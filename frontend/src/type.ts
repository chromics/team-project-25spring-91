// Common interfaces (you can put these in a separate file)
interface Exercise {
    exerciseId: number;
    plannedSets: number;
    plannedReps: number;
}

interface PlannedWorkout {
    id?: number;
    title: string;
    scheduledDate: string;
    estimatedDuration: number;
    plannedExercises: Exercise[];
    targetCalories?: number; // Optional if you want to keep tracking calories
}