// types/exercise.ts
export interface Exercise {
    exerciseId: number;
    plannedSets: number;
    plannedReps: number;
}

export interface ExerciseOption {
    id: number | string;
    name: string;
    category: string;
}

export interface PlannedExercise {
    id: number;
    exercise: {
        name: string;
        category: string;
    };
    plannedSets: number | null;
    plannedReps: number | null;
    plannedDuration: number | null;
}