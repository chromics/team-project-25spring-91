const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const actualService = {
  getAllActualWorkouts: async (userId) => {
    const workouts = await prisma.actualWorkout.findMany({
      where: { userId },
      include: {
        actualExercises: {
          include: {
            exercise: true
          }
        },
        plannedWorkout: {
          select: {
            id: true,
            title: true,
            scheduledDate: true
          }
        }
      },
      orderBy: {
        completedDate: 'desc'
      }
    });
    
    return workouts;
  },
  
  getWorkoutHistory: async (userId, startDate, endDate, limit = 10, page = 1) => {
    const skip = (page - 1) * limit;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = startDate;
    }
    if (endDate) {
      dateFilter.lte = endDate;
    }
    
    // Apply date filter only if either start or end date is provided
    const whereClause = {
      userId
    };
    
    if (Object.keys(dateFilter).length > 0) {
      whereClause.completedDate = dateFilter;
    }
    
    // Get total count
    const totalItems = await prisma.actualWorkout.count({
      where: whereClause
    });
    
    // Get paginated workouts
    const workouts = await prisma.actualWorkout.findMany({
      where: whereClause,
      include: {
        actualExercises: {
          include: {
            exercise: true,
            plannedExercise: {
              select: {
                plannedSets: true,
                plannedReps: true,
                plannedWeight: true,
                plannedDuration: true
              }
            }
          }
        },
        plannedWorkout: {
          select: {
            id: true,
            title: true,
            scheduledDate: true
          }
        }
      },
      orderBy: {
        completedDate: 'desc'
      },
      skip,
      take: limit
    });
    
    return {
      workouts,
      totalItems,
      totalPages: Math.ceil(totalItems / limit)
    };
  },
  
  getPlannedVsActualComparison: async (userId) => {
    // Get all actual workouts that are linked to planned workouts
    const workouts = await prisma.actualWorkout.findMany({
      where: {
        userId,
        plannedId: {
          not: null
        }
      },
      include: {
        plannedWorkout: {
          select: {
            title: true,
            scheduledDate: true,
            estimatedDuration: true
          }
        },
        actualExercises: {
          include: {
            exercise: true,
            plannedExercise: true
          }
        }
      },
      orderBy: {
        completedDate: 'desc'
      }
    });
    
    // Calculate statistics for each workout
    const comparisonData = workouts.map(workout => {
      const dateDeviation = workout.plannedWorkout.scheduledDate 
        ? Math.abs(
            (new Date(workout.completedDate).getTime() - 
             new Date(workout.plannedWorkout.scheduledDate).getTime()) / 
            (1000 * 60 * 60 * 24)
          )
        : null;
      
      const durationDeviation = workout.plannedWorkout.estimatedDuration && workout.actualDuration
        ? workout.actualDuration - workout.plannedWorkout.estimatedDuration
        : null;
      
      // Calculate exercise-level metrics
      const exerciseComparisons = workout.actualExercises
        .filter(ex => ex.plannedExercise) // Only include exercises with planned data
        .map(ex => {
          const weightDiff = ex.actualWeight && ex.plannedExercise.plannedWeight
            ? (ex.actualWeight - ex.plannedExercise.plannedWeight)
            : null;
          
          const repsDiff = ex.actualReps && ex.plannedExercise.plannedReps
            ? (ex.actualReps - ex.plannedExercise.plannedReps)
            : null;
          
          const setsDiff = ex.actualSets && ex.plannedExercise.plannedSets
            ? (ex.actualSets - ex.plannedExercise.plannedSets)
            : null;
          
          return {
            exerciseName: ex.exercise.name,
            plannedSets: ex.plannedExercise.plannedSets,
            actualSets: ex.actualSets,
            setsDifference: setsDiff,
            plannedReps: ex.plannedExercise.plannedReps,
            actualReps: ex.actualReps,
            repsDifference: repsDiff,
            plannedWeight: ex.plannedExercise.plannedWeight,
            actualWeight: ex.actualWeight,
            weightDifference: weightDiff
          };
        });
      
      return {
        workoutId: workout.id,
        title: workout.title,
        plannedDate: workout.plannedWorkout.scheduledDate,
        completedDate: workout.completedDate,
        dateDeviation,
        plannedDuration: workout.plannedWorkout.estimatedDuration,
        actualDuration: workout.actualDuration,
        durationDeviation,
        exerciseComparisons
      };
    });
    
    // Calculate overall adherence metrics
    const plannedCount = await prisma.plannedWorkout.count({
      where: { userId }
    });
    
    const completedPlannedCount = await prisma.actualWorkout.count({
      where: {
        userId,
        plannedId: { not: null }
      }
    });
    
    const adherenceRate = plannedCount > 0 
      ? (completedPlannedCount / plannedCount) * 100 
      : 0;
    
    // Average metrics
    let totalDateDeviation = 0;
    let dateDeviationCount = 0;
    let totalDurationDeviation = 0;
    let durationDeviationCount = 0;
    
    comparisonData.forEach(workout => {
      if (workout.dateDeviation !== null) {
        totalDateDeviation += workout.dateDeviation;
        dateDeviationCount++;
      }
      
      if (workout.durationDeviation !== null) {
        totalDurationDeviation += workout.durationDeviation;
        durationDeviationCount++;
      }
    });
    
    const avgDateDeviation = dateDeviationCount > 0 
      ? totalDateDeviation / dateDeviationCount 
      : 0;
    
    const avgDurationDeviation = durationDeviationCount > 0 
      ? totalDurationDeviation / durationDeviationCount 
      : 0;
    
    return {
      adherenceRate,
      workoutCount: comparisonData.length,
      avgDateDeviation,
      avgDurationDeviation,
      workouts: comparisonData
    };
  },
  
  getActualWorkoutById: async (userId, workoutId) => {
    const workout = await prisma.actualWorkout.findFirst({
      where: {
        id: workoutId,
        userId
      },
      include: {
        actualExercises: {
          include: {
            exercise: true,
            plannedExercise: true
          }
        },
        plannedWorkout: {
          include: {
            plannedExercises: {
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
  
  createActualWorkout: async (workoutData) => {
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
    
    // Verify planned workout if provided
    if (workoutData.plannedId) {
      const plannedWorkout = await prisma.plannedWorkout.findFirst({
        where: {
          id: workoutData.plannedId,
          userId: workoutData.userId
        }
      });
      
      if (!plannedWorkout) {
        throw new ApiError(404, 'Planned workout not found');
      }
      
      // Update planned workout status to indicate completion
      await prisma.plannedWorkout.update({
        where: { id: workoutData.plannedId },
        data: { reminderSent: true } // Mark as reminder sent to prevent future notifications
      });
    }
    
    // Prepare completed time
    let completedTime = null;
    if (workoutData.completedTime) {
      // Handle time string in format "HH:MM"
      const [hours, minutes] = workoutData.completedTime.split(':');
      completedTime = new Date();
      completedTime.setHours(parseInt(hours, 10));
      completedTime.setMinutes(parseInt(minutes, 10));
      completedTime.setSeconds(0);
      completedTime.setMilliseconds(0);
    }
    
    // Create workout and exercises
    const newWorkout = await prisma.actualWorkout.create({
      data: {
        userId: workoutData.userId,
        plannedId: workoutData.plannedId || null,
        title: workoutData.title,
        completedDate: new Date(workoutData.completedDate),
        completedTime,
        actualDuration: workoutData.actualDuration,
        actualExercises: {
          create: workoutData.exercises.map(exercise => ({
            exerciseId: exercise.exerciseId,
            plannedExerciseId: exercise.plannedExerciseId || null,
            actualSets: exercise.actualSets,
            actualReps: exercise.actualReps,
            actualWeight: exercise.actualWeight,
            actualDuration: exercise.actualDuration
          }))
        }
      },
      include: {
        actualExercises: {
          include: {
            exercise: true,
            plannedExercise: true
          }
        },
        plannedWorkout: {
          select: {
            title: true,
            scheduledDate: true
          }
        }
      }
    });
    
    return newWorkout;
  },
  
  createFromPlannedWorkout: async (workoutData) => {
    // Verify planned workout exists and belongs to user
    const plannedWorkout = await prisma.plannedWorkout.findFirst({
      where: {
        id: workoutData.plannedId,
        userId: workoutData.userId
      },
      include: {
        plannedExercises: {
          include: {
            exercise: true
          }
        }
      }
    });
    
    if (!plannedWorkout) {
      throw new ApiError(404, 'Planned workout not found');
    }
    
    // Check if this planned workout already has an actual workout
    const existingActual = await prisma.actualWorkout.findFirst({
      where: {
        plannedId: workoutData.plannedId
      }
    });
    
    if (existingActual) {
      throw new ApiError(400, 'This planned workout has already been logged');
    }
    
    // Prepare completed time
    let completedTime = null;
    if (workoutData.completedTime) {
      // Handle time string in format "HH:MM"
      const [hours, minutes] = workoutData.completedTime.split(':');
      completedTime = new Date();
      completedTime.setHours(parseInt(hours, 10));
      completedTime.setMinutes(parseInt(minutes, 10));
      completedTime.setSeconds(0);
      completedTime.setMilliseconds(0);
    }
    
    // Prepare exercises data
    let exercisesData;
    
    if (workoutData.exercises) {
      // User provided specific exercise data - validate it
      const providedExerciseIds = workoutData.exercises.map(ex => ex.exerciseId);
      
      // Verify all exercises exist
      const exercises = await prisma.exercise.findMany({
        where: {
          id: {
            in: providedExerciseIds
          }
        }
      });
      
      if (exercises.length !== providedExerciseIds.length) {
        throw new ApiError(400, 'Some exercises do not exist');
      }
      
      // Verify planned exercise IDs
      const plannedExerciseIds = workoutData.exercises
        .filter(ex => ex.plannedExerciseId)
        .map(ex => ex.plannedExerciseId);
      
      if (plannedExerciseIds.length > 0) {
        const plannedExercises = await prisma.plannedExercise.findMany({
          where: {
            id: {
              in: plannedExerciseIds
            },
            plannedId: workoutData.plannedId
          }
        });
        
        if (plannedExercises.length !== plannedExerciseIds.length) {
          throw new ApiError(400, 'Some planned exercises do not exist or do not belong to this planned workout');
        }
      }
      
      exercisesData = workoutData.exercises.map(exercise => ({
        exerciseId: exercise.exerciseId,
        plannedExerciseId: exercise.plannedExerciseId || null,
        actualSets: exercise.actualSets,
        actualReps: exercise.actualReps,
        actualWeight: exercise.actualWeight,
        actualDuration: exercise.actualDuration
      }));
    } else {
      // No exercises provided - use the planned exercises as a template
      exercisesData = plannedWorkout.plannedExercises.map(pe => ({
        exerciseId: pe.exerciseId,
        plannedExerciseId: pe.id,
        actualSets: pe.plannedSets,
        actualReps: pe.plannedReps,
        actualWeight: pe.plannedWeight,
        actualDuration: pe.plannedDuration
      }));
    }
    
    // Create actual workout
    const newWorkout = await prisma.actualWorkout.create({
      data: {
        userId: workoutData.userId,
        plannedId: workoutData.plannedId,
        title: plannedWorkout.title, // Use planned title
        completedDate: new Date(workoutData.completedDate),
        completedTime,
        actualDuration: workoutData.actualDuration || plannedWorkout.estimatedDuration,
        actualExercises: {
          create: exercisesData
        }
      },
      include: {
        actualExercises: {
          include: {
            exercise: true,
            plannedExercise: true
          }
        },
        plannedWorkout: {
          select: {
            title: true,
            scheduledDate: true
          }
        }
      }
    });
    
    // Update planned workout to mark as completed
    await prisma.plannedWorkout.update({
      where: { id: workoutData.plannedId },
      data: { reminderSent: true }
    });
    
    return newWorkout;
  },
  
  updateActualWorkout: async (userId, workoutId, updateData) => {
    // Check if workout exists and belongs to user
    const workout = await prisma.actualWorkout.findFirst({
      where: {
        id: workoutId,
        userId
      },
      include: {
        actualExercises: true
      }
    });
    
    if (!workout) {
      throw new ApiError(404, 'Workout not found');
    }
    
    // Prepare update data
    const workoutUpdateData = {
      title: updateData.title,
      completedDate: updateData.completedDate ? new Date(updateData.completedDate) : undefined,
      actualDuration: updateData.actualDuration
    };
    
    // Handle completed time
    if (updateData.completedTime) {
      const [hours, minutes] = updateData.completedTime.split(':');
      const completedTime = new Date();
      completedTime.setHours(parseInt(hours, 10));
      completedTime.setMinutes(parseInt(minutes, 10));
      completedTime.setSeconds(0);
      completedTime.setMilliseconds(0);
      workoutUpdateData.completedTime = completedTime;
    } else if (updateData.completedTime === null) {
      workoutUpdateData.completedTime = null;
    }
    
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
        actualExercises: {
          deleteMany: {},
          create: updateData.exercises.map(exercise => ({
            exerciseId: exercise.exerciseId,
            plannedExerciseId: exercise.plannedExerciseId || null,
            actualSets: exercise.actualSets,
            actualReps: exercise.actualReps,
            actualWeight: exercise.actualWeight,
            actualDuration: exercise.actualDuration
          }))
        }
      };
    }
    
    // Update workout
    const updatedWorkout = await prisma.actualWorkout.update({
      where: { id: workoutId },
      data: {
        ...workoutUpdateData,
        ...exercisesUpdate
      },
      include: {
        actualExercises: {
          include: {
            exercise: true,
            plannedExercise: true
          }
        },
        plannedWorkout: {
          select: {
            title: true,
            scheduledDate: true
          }
        }
      }
    });
    
    return updatedWorkout;
  },
  
  deleteActualWorkout: async (userId, workoutId) => {
    // Check if workout exists and belongs to user
    const workout = await prisma.actualWorkout.findFirst({
      where: {
        id: workoutId,
        userId
      }
    });
    
    if (!workout) {
      throw new ApiError(404, 'Workout not found');
    }
    
    // If this was linked to a planned workout, we may want to update its status
    if (workout.plannedId) {
      // Note: We don't reset the reminderSent field because the date might be in the past
      // If the user wants to reschedule, they should update the planned workout
    }
    
    // Delete workout (cascade will delete actual exercises)
    await prisma.actualWorkout.delete({
      where: { id: workoutId }
    });
  }
};

module.exports = { actualService };