// types/completed-exercise.ts
export interface CompletedExercise {
    exerciseId: number;
    actualSets: number | null;
    actualReps: number | null;
    actualDuration: number | null;
}

export interface DetailedCompletedExercise {
    id: number;
    actualId: number;
    exerciseId: number;
    plannedExerciseId: null;
    actualSets: number | null;
    actualReps: number | null;
    actualWeight: number | null;
    actualDuration: number | null;
    exercise: {
        id: number;
        name: string;
        category: string;
        description: string;
        createdAt: string;
    };
    plannedExercise: null;
}