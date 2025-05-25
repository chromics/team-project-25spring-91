// src/controllers/dietEntry.controller.js
const { dietEntryService } = require('../services/dietEntry.service');

const dietEntryController = {
  // Get user's diet entries
  getUserDietEntries: async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate, mealType, page = 1, limit = 20 } = req.query;
    
    const result = await dietEntryService.getUserDietEntries(userId, {
      startDate,
      endDate,
      mealType,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.status(200).json({
      status: 'success',
      results: result.dietEntries.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: result.totalPages,
        totalItems: result.totalItems
      },
      data: result.dietEntries
    });
  },
  
  // Get user's diet entry by ID
  getDietEntryById: async (req, res) => {
    const userId = req.user.id;
    const entryId = parseInt(req.params.id);
    
    const dietEntry = await dietEntryService.getDietEntryById(entryId, userId);
    
    res.status(200).json({
      status: 'success',
      data: dietEntry
    });
  },
  
  // Create a diet entry
  createDietEntry: async (req, res) => {
    const userId = req.user.id;
    
    const dietEntry = await dietEntryService.createDietEntry(userId, req.body);
    
    res.status(201).json({
      status: 'success',
      message: 'Diet entry created successfully',
      data: dietEntry
    });
  },
  
  // Update a diet entry
  updateDietEntry: async (req, res) => {
    const userId = req.user.id;
    const entryId = parseInt(req.params.id);
    
    const updatedEntry = await dietEntryService.updateDietEntry(entryId, userId, req.body);
    
    res.status(200).json({
      status: 'success',
      message: 'Diet entry updated successfully',
      data: updatedEntry
    });
  },
  
  // Delete a diet entry
  deleteDietEntry: async (req, res) => {
    const userId = req.user.id;
    const entryId = parseInt(req.params.id);
    
    await dietEntryService.deleteDietEntry(entryId, userId);
    
    res.status(200).json({
      status: 'success',
      message: 'Diet entry deleted successfully'
    });
  },
  
  // Get user's diet summary
  getUserDietSummary: async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    const summary = await dietEntryService.getUserDietSummary(userId, {
      startDate,
      endDate
    });
    
    res.status(200).json({
      status: 'success',
      data: summary
    });
  }
};

module.exports = { dietEntryController };