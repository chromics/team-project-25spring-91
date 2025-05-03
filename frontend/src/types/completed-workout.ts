// types/completed-workout.ts
import { DetailedCompletedExercise } from './completed-exercise';

export interface CompletedWorkout {
    id: number;
    title: string;
    completedDate: string;
    completedTime: string | null;
    actualDuration: number | null;
    createdAt: string;
    actualExercises: DetailedCompletedExercise[];
    plannedWorkout: null;
}

export interface CompletedWorkoutGroup {
    today: CompletedWorkout[];
    lastWeek: CompletedWorkout[];
    past: CompletedWorkout[];
}