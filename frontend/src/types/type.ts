{
  /**
            * AI generated code 
             tool: chat-gpt 
             version: o3 mini high
             usage: this was for testing only, we dont use it anymore, will delete after everything is finished
            */
}

interface Exercise {
  plannedDuration: React.JSX.Element;
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
  targetCalories?: number;
}


