// types/props.ts
import { Goal, PlannedWorkout } from './workout';
import { Exercise } from './exercise';
import { CompletedWorkout } from './completed-workout';
import { CompletedExercise } from './completed-exercise';

export interface SheetDemoProps {
    propAddGoal: (goal: Goal) => void;
    workouts: PlannedWorkout[];
}

export interface EditWorkoutDialogProps {
    workouts: PlannedWorkout[];
    workout: PlannedWorkout | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (workout: PlannedWorkout) => Promise<void>;
}

export interface AddExerciseDialogProps {
    propAddExercise: (exercise: Exercise) => void;
}

export interface AddCompletedTaskSheetProps {
    propAddCompletedTasks: () => void;
    workouts: CompletedWorkout[];
}

export interface EditCompletedWorkoutDialogProps {
    workouts: CompletedWorkout[];
    workout: CompletedWorkout | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (workout: CompletedWorkout) => Promise<void>;
}

export interface AddCompletedExerciseDialogProps {
    propAddExercise: (exercise: CompletedExercise) => void;
}