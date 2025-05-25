// src/services/foodItem.service.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const foodItemService = {
  // Get all food items (with search and pagination)
  getAllFoodItems: async ({ search = '', page = 1, limit = 20 }) => {
    const where = search 
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        } 
      : {};
    
    // Get total count for pagination
    const totalItems = await prisma.foodItem.count({ where });
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get food items with pagination
    const foodItems = await prisma.foodItem.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return {
      foodItems,
      totalItems,
      totalPages
    };
  },

  // Get food item by ID
  getFoodItemById: async (foodItemId) => {
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: foodItemId }
    });
    
    if (!foodItem) {
      throw new ApiError(404, 'Food item not found');
    }
    
    return foodItem;
  },

  // Create a food item
  createFoodItem: async (data) => {
    // Check if food item with this name already exists
    const existingItem = await prisma.foodItem.findUnique({
      where: { name: data.name }
    });
    
    if (existingItem) {
      throw new ApiError(409, 'A food item with this name already exists');
    }
    
    return prisma.foodItem.create({
      data: {
        name: data.name,
        description: data.description,
        caloriesPerUnit: data.caloriesPerUnit,
        servingUnit: data.servingUnit,
        imageUrl: data.imageUrl
      }
    });
  },

  // Update a food item
  updateFoodItem: async (foodItemId, data) => {
    // Check if food item exists
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: foodItemId }
    });
    
    if (!foodItem) {
      throw new ApiError(404, 'Food item not found');
    }
    
    // Check name uniqueness if updating name
    if (data.name && data.name !== foodItem.name) {
      const existingItem = await prisma.foodItem.findUnique({
        where: { name: data.name }
      });
      
      if (existingItem) {
        throw new ApiError(409, 'A food item with this name already exists');
      }
    }
    
    return prisma.foodItem.update({
      where: { id: foodItemId },
      data
    });
  },

  // Delete a food item
  deleteFoodItem: async (foodItemId) => {
    // Check if food item exists
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: foodItemId }
    });
    
    if (!foodItem) {
      throw new ApiError(404, 'Food item not found');
    }
    
    // Check if the food item is used in any diet entries
    const entryCount = await prisma.dietEntry.count({
      where: { foodId: foodItemId }
    });
    
    if (entryCount > 0) {
      throw new ApiError(400, `This food item is used in ${entryCount} diet entries and cannot be deleted`);
    }
    
    return prisma.foodItem.delete({
      where: { id: foodItemId }
    });
  }
};

module.exports = { foodItemService };