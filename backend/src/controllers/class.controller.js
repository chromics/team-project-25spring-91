// src/controllers/class.controller.js
const { classService } = require('../services/class.service');

const classController = {
  getAllGymClasses: async (req, res) => {
    const { gymId, difficultyLevel, search, page = 1, limit = 10 } = req.query;
    
    const classesData = await classService.getAllGymClasses({
      gymId: gymId ? parseInt(gymId) : undefined,
      difficultyLevel,
      search,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.status(200).json({
      status: 'success',
      results: classesData.classes.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: classesData.totalPages,
        totalItems: classesData.totalItems
      },
      data: classesData.classes
    });
  },
  
  getGymClassById: async (req, res) => {
    const classId = parseInt(req.params.id);
    const gymClass = await classService.getGymClassById(classId);
    
    res.status(200).json({
      status: 'success',
      data: gymClass
    });
  },
  
  getClassSchedules: async (req, res) => {
    const classId = parseInt(req.params.id);
    const { startDate, endDate } = req.query;
    
    const schedules = await classService.getClassSchedules(
      classId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    
    res.status(200).json({
      status: 'success',
      results: schedules.length,
      data: schedules
    });
  }
};

module.exports = { classController };