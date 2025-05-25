// src/services/dietEntry.service.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const dietEntryService = {
  // Get user's diet entries (with filters and pagination)
  getUserDietEntries: async (userId, {
    startDate,
    endDate,
    mealType,
    page = 1,
    limit = 20
  }) => {
    // Build filter conditions
    const where = {
      userId,
      ...(startDate && { consumptionDate: { gte: new Date(startDate) } }),
      ...(endDate && { consumptionDate: { lte: new Date(endDate) } }),
      ...(mealType && { mealType })
    };
    
    // Get total count for pagination
    const totalItems = await prisma.dietEntry.count({ where });
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get diet entries with pagination
    const dietEntries = await prisma.dietEntry.findMany({
      where,
      orderBy: { consumptionDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        foodItem: true
      }
    });
    
    return {
      dietEntries,
      totalItems,
      totalPages
    };
  },

  // Get user's diet entry by ID
  getDietEntryById: async (entryId, userId) => {
    const dietEntry = await prisma.dietEntry.findUnique({
      where: { id: entryId },
      include: {
        foodItem: true
      }
    });
    
    if (!dietEntry) {
      throw new ApiError(404, 'Diet entry not found');
    }
    
    // Check if the entry belongs to the user
    if (dietEntry.userId !== userId) {
      throw new ApiError(403, 'You do not have permission to access this diet entry');
    }
    
    return dietEntry;
  },

  // Create a diet entry
  createDietEntry: async (userId, data) => {
    // Check if food item exists
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: data.foodId }
    });
    
    if (!foodItem) {
      throw new ApiError(404, 'Food item not found');
    }
    
    // Calculate total calories
    const calories = parseFloat(foodItem.caloriesPerUnit) * parseFloat(data.quantity);
    
    return prisma.dietEntry.create({
      data: {
        userId,
        foodId: data.foodId,
        quantity: data.quantity,
        calories,
        consumptionDate: new Date(data.consumptionDate),
        mealType: data.mealType || 'snack',
        notes: data.notes
      },
      include: {
        foodItem: true
      }
    });
  },

  // Update a diet entry
  updateDietEntry: async (entryId, userId, data) => {
    // Check if diet entry exists and belongs to user
    const dietEntry = await prisma.dietEntry.findUnique({
      where: { id: entryId }
    });
    
    if (!dietEntry) {
      throw new ApiError(404, 'Diet entry not found');
    }
    
    if (dietEntry.userId !== userId) {
      throw new ApiError(403, 'You do not have permission to update this diet entry');
    }
    
    // Calculate new calories if food or quantity is changing
    let calories = dietEntry.calories;
    
    if (data.foodId || data.quantity !== undefined) {
      const foodId = data.foodId || dietEntry.foodId;
      const quantity = data.quantity !== undefined ? data.quantity : dietEntry.quantity;
      
      const foodItem = await prisma.foodItem.findUnique({
        where: { id: foodId }
      });
      
      if (!foodItem) {
        throw new ApiError(404, 'Food item not found');
      }
      
      calories = parseFloat(foodItem.caloriesPerUnit) * parseFloat(quantity);
    }
    
    return prisma.dietEntry.update({
      where: { id: entryId },
      data: {
        ...(data.foodId && { foodId: data.foodId }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        calories,
        ...(data.consumptionDate && { consumptionDate: new Date(data.consumptionDate) }),
        ...(data.mealType && { mealType: data.mealType }),
        ...(data.notes !== undefined && { notes: data.notes })
      },
      include: {
        foodItem: true
      }
    });
  },

  // Delete a diet entry
  deleteDietEntry: async (entryId, userId) => {
    // Check if diet entry exists and belongs to user
    const dietEntry = await prisma.dietEntry.findUnique({
      where: { id: entryId }
    });
    
    if (!dietEntry) {
      throw new ApiError(404, 'Diet entry not found');
    }
    
    if (dietEntry.userId !== userId) {
      throw new ApiError(403, 'You do not have permission to delete this diet entry');
    }
    
    return prisma.dietEntry.delete({
      where: { id: entryId }
    });
  },

  // Get user's diet summary (calories by day, meal type, etc.)
  getUserDietSummary: async (userId, { startDate, endDate }) => {
    // Validate dates
    const validStartDate = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default 1 week ago
    const validEndDate = endDate ? new Date(endDate) : new Date(); // Default today
    
    // Get all diet entries in the date range
    const dietEntries = await prisma.dietEntry.findMany({
      where: {
        userId,
        consumptionDate: {
          gte: validStartDate,
          lte: validEndDate
        }
      },
      include: {
        foodItem: true
      },
      orderBy: {
        consumptionDate: 'asc'
      }
    });
    
    // Process entries to create summary data
    const dailySummary = {};
    const mealTypeSummary = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0
    };
    
    let totalCalories = 0;
    
    dietEntries.forEach(entry => {
      // Daily summary
      const dateKey = entry.consumptionDate.toISOString().split('T')[0];
      if (!dailySummary[dateKey]) {
        dailySummary[dateKey] = 0;
      }
      dailySummary[dateKey] += parseFloat(entry.calories);
      
      // Meal type summary
      const mealType = entry.mealType || 'snack';
      mealTypeSummary[mealType] += parseFloat(entry.calories);
      
      // Total
      totalCalories += parseFloat(entry.calories);
    });
    
    // Format dates as array for chart rendering
    const dates = Object.keys(dailySummary).sort();
    const dailyCalories = dates.map(date => ({
      date,
      calories: dailySummary[date]
    }));
    
    // Calculate average calories per day
    const avgCaloriesPerDay = dates.length > 0 
      ? totalCalories / dates.length 
      : 0;
    
    return {
      period: {
        startDate: validStartDate,
        endDate: validEndDate
      },
      totalEntries: dietEntries.length,
      totalCalories,
      avgCaloriesPerDay,
      dailyCalories,
      mealTypeSummary
    };
  }
};

module.exports = { dietEntryService };