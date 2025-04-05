const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');
  
  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      displayName: 'Test User',
      gender: 'Other',
      heightCm: 175,
      weightKg: 70
    }
  });
  
  console.log(`Created user: ${testUser.email}`);
  
  // Create some exercise categories
  const categories = ['strength', 'cardio', 'flexibility', 'balance'];
  
  // Create exercises
  const exercisesData = [
    { name: 'Push-up', category: 'strength', description: 'Basic chest exercise using bodyweight' },
    { name: 'Squat', category: 'strength', description: 'Lower body exercise targeting quadriceps, hamstrings and glutes' },
    { name: 'Plank', category: 'strength', description: 'Core stabilizing exercise' },
    { name: 'Deadlift', category: 'strength', description: 'Compound exercise for posterior chain' },
    { name: 'Running', category: 'cardio', description: 'Cardiovascular exercise to improve endurance' },
    { name: 'Jumping Jacks', category: 'cardio', description: 'Full body cardio exercise' },
    { name: 'Mountain Climbers', category: 'cardio', description: 'Dynamic core exercise with cardio benefits' },
    { name: 'Hamstring Stretch', category: 'flexibility', description: 'Stretch for the back of your legs' },
    { name: 'Downward Dog', category: 'flexibility', description: 'Yoga pose that stretches the entire posterior chain' },
    { name: 'One-Leg Balance', category: 'balance', description: 'Stand on one leg to improve balance' }
  ];
  
  for (const exerciseData of exercisesData) {
    const exercise = await prisma.exercise.upsert({
      where: { name: exerciseData.name },
      update: {},
      create: exerciseData
    });
    
    console.log(`Created exercise: ${exercise.name}`);
  }
  
  // Create some sample workouts
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  // Sample workout 1 - Upper Body
  const upperBodyWorkout = await prisma.plannedWorkout.create({
    data: {
      userId: testUser.id,
      title: 'Upper Body Workout',
      scheduledDate: tomorrow,
      estimatedDuration: 45,
      plannedExercises: {
        create: [
          {
            exerciseId: 1, // Push-up
            plannedSets: 3,
            plannedReps: 12
          },
          {
            exerciseId: 3, // Plank
            plannedSets: 3,
            plannedDuration: 1 // 1 minute
          }
        ]
      }
    }
  });
  
  console.log(`Created planned workout: ${upperBodyWorkout.title}`);
  
  // Sample workout 2 - Cardio
  const cardioWorkout = await prisma.plannedWorkout.create({
    data: {
      userId: testUser.id,
      title: 'Cardio Session',
      scheduledDate: nextWeek,
      estimatedDuration: 30,
      plannedExercises: {
        create: [
          {
            exerciseId: 5, // Running
            plannedDuration: 20
          },
          {
            exerciseId: 6, // Jumping Jacks
            plannedSets: 3,
            plannedReps: 30
          }
        ]
      }
    }
  });
  
  console.log(`Created planned workout: ${cardioWorkout.title}`);
  
  // Sample completed workout
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  
  const completedWorkout = await prisma.actualWorkout.create({
    data: {
      userId: testUser.id,
      title: 'Full Body Workout',
      completedDate: lastWeek,
      actualDuration: 50,
      actualExercises: {
        create: [
          {
            exerciseId: 1, // Push-up
            actualSets: 3,
            actualReps: 10
          },
          {
            exerciseId: 2, // Squat
            actualSets: 3,
            actualReps: 15
          },
          {
            exerciseId: 3, // Plank
            actualSets: 3,
            actualDuration: 1
          }
        ]
      }
    }
  });
  
  console.log(`Created completed workout: ${completedWorkout.title}`);
  
  console.log('Database seeding completed!');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });