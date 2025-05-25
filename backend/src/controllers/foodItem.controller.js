// src/controllers/foodItem.controller.js
const { foodItemService } = require('../services/foodItem.service');

const foodItemController = {
  // Get all food items
  getAllFoodItems: async (req, res) => {
    const { search, page = 1, limit = 20 } = req.query;
    
    const result = await foodItemService.getAllFoodItems({
      search,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.status(200).json({
      status: 'success',
      results: result.foodItems.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: result.totalPages,
        totalItems: result.totalItems
      },
      data: result.foodItems
    });
  },
  
  // Get food item by ID
  getFoodItemById: async (req, res) => {
    const foodItemId = parseInt(req.params.id);
    
    const foodItem = await foodItemService.getFoodItemById(foodItemId);
    
    res.status(200).json({
      status: 'success',
      data: foodItem
    });
  },
  
  // Create food item (admin only)
  createFoodItem: async (req, res) => {
    const foodItem = await foodItemService.createFoodItem(req.body);
    
    res.status(201).json({
      status: 'success',
      message: 'Food item created successfully',
      data: foodItem
    });
  },
  
  // Update food item (admin only)
  updateFoodItem: async (req, res) => {
    const foodItemId = parseInt(req.params.id);
    
    const updatedFoodItem = await foodItemService.updateFoodItem(foodItemId, req.body);
    
    res.status(200).json({
      status: 'success',
      message: 'Food item updated successfully',
      data: updatedFoodItem
    });
  },
  
  // Delete food item (admin only)
  deleteFoodItem: async (req, res) => {
    const foodItemId = parseInt(req.params.id);
    
    await foodItemService.deleteFoodItem(foodItemId);
    
    res.status(200).json({
      status: 'success',
      message: 'Food item deleted successfully'
    });
  }
};

module.exports = { foodItemController };