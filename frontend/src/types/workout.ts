// types/workout.ts
import { PlannedExercise } from './exercise';

export interface PlannedWorkout {
    id: number;
    title: string;
    scheduledDate: string;
    estimatedDuration: number;
    reminderSent: boolean;
    plannedExercises: PlannedExercise[];
}

export interface WorkoutGroup {
    future: PlannedWorkout[];
    today: PlannedWorkout[];
    lastWeek: PlannedWorkout[];
    past: PlannedWorkout[];
}

export interface Goal {
    date: string;
    calories: number;
    title: string;
}