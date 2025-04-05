const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const exerciseService = {
  getAllExercises: async (category, search) => {
    const filters = {};
    
    if (category) {
      filters.category = category;
    }
    
    if (search) {
      filters.name = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    const exercises = await prisma.exercise.findMany({
      where: filters,
      orderBy: {
        name: 'asc'
      }
    });
    
    return exercises;
  },
  
  getExerciseById: async (exerciseId) => {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    });
    
    if (!exercise) {
      throw new ApiError(404, 'Exercise not found');
    }
    
    return exercise;
  },
  
  createExercise: async (exerciseData) => {
    // Check if exercise with the same name already exists
    const existingExercise = await prisma.exercise.findFirst({
      where: {
        name: {
          equals: exerciseData.name,
          mode: 'insensitive'
        }
      }
    });
    
    if (existingExercise) {
      throw new ApiError(409, 'Exercise with this name already exists');
    }
    
    const newExercise = await prisma.exercise.create({
      data: {
        name: exerciseData.name,
        category: exerciseData.category,
        description: exerciseData.description
      }
    });
    
    return newExercise;
  },
  
  updateExercise: async (exerciseId, updateData) => {
    // Check if exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    });
    
    if (!exercise) {
      throw new ApiError(404, 'Exercise not found');
    }
    
    // Check for name conflict if name is being updated
    if (updateData.name && updateData.name !== exercise.name) {
      const existingExercise = await prisma.exercise.findFirst({
        where: {
          name: {
            equals: updateData.name,
            mode: 'insensitive'
          },
          id: {
            not: exerciseId
          }
        }
      });
      
      if (existingExercise) {
        throw new ApiError(409, 'Exercise with this name already exists');
      }
    }
    
    const updatedExercise = await prisma.exercise.update({
      where: { id: exerciseId },
      data: updateData
    });
    
    return updatedExercise;
  },
  
  deleteExercise: async (exerciseId) => {
    // Check if exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    });
    
    if (!exercise) {
      throw new ApiError(404, 'Exercise not found');
    }
    
    // Check if exercise is used in any workouts
    const usedInPlanned = await prisma.plannedExercise.findFirst({
      where: { exerciseId }
    });
    
    if (usedInPlanned) {
      throw new ApiError(400, 'Cannot delete exercise that is used in planned workouts');
    }
    
    const usedInActual = await prisma.actualExercise.findFirst({
      where: { exerciseId }
    });
    
    if (usedInActual) {
      throw new ApiError(400, 'Cannot delete exercise that is used in workout logs');
    }
    
    await prisma.exercise.delete({
      where: { id: exerciseId }
    });
  }
};

module.exports = { exerciseService };