// src/data/exerciseData.ts

export const exerciseCategories = {
    STRENGTH: 'strength',
    CARDIO: 'cardio',
    FLEXIBILITY: 'flexibility',
    BODYWEIGHT: 'bodyweight'
} as const;

export const exercises = [
    // Strength Training
    { id: 1, name: "Bench Press", category: exerciseCategories.STRENGTH, description: "Barbell chest press on a flat bench" },
    { id: 2, name: "Back Squat", category: exerciseCategories.STRENGTH, description: "Barbell squat with weight on upper back" },
    { id: 3, name: "Deadlift", category: exerciseCategories.STRENGTH, description: "Barbell lift from floor to hip level" },
    { id: 4, name: "Overhead Press", category: exerciseCategories.STRENGTH, description: "Standing barbell press above head" },
    { id: 5, name: "Barbell Row", category: exerciseCategories.STRENGTH, description: "Bent-over barbell row for back" },
    
    // Bodyweight Exercises
    { id: 6, name: "Push-ups", category: exerciseCategories.BODYWEIGHT, description: "Classic bodyweight chest exercise" },
    { id: 7, name: "Pull-ups", category: exerciseCategories.BODYWEIGHT, description: "Overhead bar pull-up" },
    { id: 8, name: "Dips", category: exerciseCategories.BODYWEIGHT, description: "Parallel bar dips for chest/triceps" },
    { id: 9, name: "Bodyweight Squats", category: exerciseCategories.BODYWEIGHT, description: "Basic squat movement without weights" },
    { id: 10, name: "Lunges", category: exerciseCategories.BODYWEIGHT, description: "Forward stepping lunge movement" },
    
    // Cardio
    { id: 11, name: "Running", category: exerciseCategories.CARDIO, description: "Outdoor or treadmill running" },
    { id: 12, name: "Jump Rope", category: exerciseCategories.CARDIO, description: "Basic jump rope cardio" },
    { id: 13, name: "Burpees", category: exerciseCategories.CARDIO, description: "Full-body cardio movement" },
    { id: 14, name: "Mountain Climbers", category: exerciseCategories.CARDIO, description: "Floor-based cardio exercise" },
    
    // Flexibility/Mobility
    { id: 15, name: "Forward Fold", category: exerciseCategories.FLEXIBILITY, description: "Standing forward bend stretch" },
    { id: 16, name: "Hip Flexor Stretch", category: exerciseCategories.FLEXIBILITY, description: "Kneeling hip flexor stretch" },
    { id: 17, name: "Shoulder Dislocates", category: exerciseCategories.FLEXIBILITY, description: "Shoulder mobility with band" },
    { id: 18, name: "Cat-Cow Stretch", category: exerciseCategories.FLEXIBILITY, description: "Spinal mobility exercise" }
];