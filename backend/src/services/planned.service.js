// src/services/planned.service.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const { notificationService } = require('./notifications.service');

const plannedService = {
  getAllPlannedWorkouts: async (userId) => {
    const workouts = await prisma.plannedWorkout.findMany({
      where: { userId },
      include: {
        plannedExercises: {
          include: {
            exercise: true
          }
        },
        actualWorkouts: {
          select: {
            id: true,
            completedDate: true
          }
        }
      },
      orderBy: {
        scheduledDate: 'desc'
      },
      // take: 30
    });
    
    return workouts;
  },
  
  getUpcomingWorkouts: async (userId, days = 7) => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);
    
    const workouts = await prisma.plannedWorkout.findMany({
      where: {
        userId,
        scheduledDate: {
          gte: today,
          lte: endDate
        }
      },
      include: {
        plannedExercises: {
          include: {
            exercise: true
          }
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });
    
    return workouts;
  },
  
  getPlannedWorkoutById: async (userId, workoutId) => {
    const workout = await prisma.plannedWorkout.findFirst({
      where: {
        id: workoutId,
        userId
      },
      include: {
        plannedExercises: {
          include: {
            exercise: true
          }
        },
        actualWorkouts: {
          include: {
            actualExercises: {
              include: {
                exercise: true
              }
            }
          }
        }
      }
    });
    
    if (!workout) {
      throw new ApiError(404, 'Workout not found');
    }
    
    return workout;
  },
  
  createPlannedWorkout: async (workoutData) => {
    // Verify exercises exist
    const exerciseIds = workoutData.exercises.map(ex => ex.exerciseId);
    const exercises = await prisma.exercise.findMany({
      where: {
        id: {
          in: exerciseIds
        }
      }
    });
    
    if (exercises.length !== exerciseIds.length) {
      throw new ApiError(400, 'Some exercises do not exist');
    }
    
    // Create workout and exercises
    const newWorkout = await prisma.plannedWorkout.create({
      data: {
        userId: workoutData.userId,
        title: workoutData.title,
        scheduledDate: new Date(workoutData.scheduledDate),
        estimatedDuration: workoutData.estimatedDuration,
        plannedExercises: {
          create: workoutData.exercises.map(exercise => ({
            exerciseId: exercise.exerciseId,
            plannedSets: exercise.plannedSets,
            plannedReps: exercise.plannedReps,
            plannedWeight: exercise.plannedWeight,
            plannedDuration: exercise.plannedDuration,
            plannedCalories: exercise.plannedCalories // Add calories support
          }))
        }
      },
      include: {
        plannedExercises: {
          include: {
            exercise: true
          }
        }
      }
    });
    
    // Schedule notification for this workout
    await notificationService.scheduleWorkoutReminder(newWorkout);
    
    return newWorkout;
  },
  
  updatePlannedWorkout: async (userId, workoutId, updateData) => {
    // Check if workout exists and belongs to user
    const workout = await prisma.plannedWorkout.findFirst({
      where: {
        id: workoutId,
        userId
      },
      include: {
        plannedExercises: true,
        actualWorkouts: true
      }
    });
    
    if (!workout) {
      throw new ApiError(404, 'Workout not found');
    }
    
    // Check if workout has been completed
    if (workout.actualWorkouts.length > 0) {
      throw new ApiError(400, 'Cannot update a workout that has been completed');
    }
    
    // Prepare update data
    const workoutUpdateData = {
      title: updateData.title,
      scheduledDate: updateData.scheduledDate ? new Date(updateData.scheduledDate) : undefined,
      estimatedDuration: updateData.estimatedDuration,
      // Reset reminder if date changed
      reminderSent: updateData.scheduledDate ? false : undefined
    };
    
    // Update exercises if provided
    let exercisesUpdate = {};
    if (updateData.exercises) {
      // Verify exercises exist
      const exerciseIds = updateData.exercises.map(ex => ex.exerciseId);
      const exercises = await prisma.exercise.findMany({
        where: {
          id: {
            in: exerciseIds
          }
        }
      });
      
      if (exercises.length !== exerciseIds.length) {
        throw new ApiError(400, 'Some exercises do not exist');
      }
      
      // Delete existing exercises and create new ones
      exercisesUpdate = {
        plannedExercises: {
          deleteMany: {},
          create: updateData.exercises.map(exercise => ({
            exerciseId: exercise.exerciseId,
            plannedSets: exercise.plannedSets,
            plannedReps: exercise.plannedReps,
            plannedWeight: exercise.plannedWeight,
            plannedDuration: exercise.plannedDuration,
            plannedCalories: exercise.plannedCalories // Add calories support
          }))
        }
      };
    }
    
    // Update workout
    const updatedWorkout = await prisma.plannedWorkout.update({
      where: { id: workoutId },
      data: {
        ...workoutUpdateData,
        ...exercisesUpdate
      },
      include: {
        plannedExercises: {
          include: {
            exercise: true
          }
        }
      }
    });
    
    // Reschedule notification if date changed
    if (updateData.scheduledDate) {
      await notificationService.scheduleWorkoutReminder(updatedWorkout);
    }
    
    return updatedWorkout;
  },
  
  deletePlannedWorkout: async (userId, workoutId) => {
    // Check if workout exists and belongs to user
    const workout = await prisma.plannedWorkout.findFirst({
      where: {
        id: workoutId,
        userId
      },
      include: {
        actualWorkouts: true
      }
    });
    
    if (!workout) {
      throw new ApiError(404, 'Workout not found');
    }
    
    // Check if workout has been completed
    if (workout.actualWorkouts.length > 0) {
      throw new ApiError(400, 'Cannot delete a workout that has been completed');
    }
    
    // Delete workout (cascade will delete planned exercises)
    await prisma.plannedWorkout.delete({
      where: { id: workoutId }
    });
    
    // Cancel any pending notifications
    await notificationService.cancelWorkoutReminder(workoutId);
  }
};

module.exports = { plannedService };