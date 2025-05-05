// src/controllers/gym.controller.js
const { gymService } = require('../services/gym.service');

const gymController = {
  getAllGyms: async (req, res) => {
    const { search, page = 1, limit = 10 } = req.query;
    
    const gymsData = await gymService.getAllGyms({
      search,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.status(200).json({
      status: 'success',
      results: gymsData.gyms.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: gymsData.totalPages,
        totalItems: gymsData.totalItems
      },
      data: gymsData.gyms
    });
  },
  
  getGymById: async (req, res) => {
    const gymId = parseInt(req.params.id);
    const gym = await gymService.getGymById(gymId);
    
    res.status(200).json({
      status: 'success',
      data: gym
    });
  },
  
  getGymClasses: async (req, res) => {
    const gymId = parseInt(req.params.id);
    const classes = await gymService.getGymClasses(gymId);
    
    res.status(200).json({
      status: 'success',
      results: classes.length,
      data: classes
    });
  },
  
  getGymMembershipPlans: async (req, res) => {
    const gymId = parseInt(req.params.id);
    const plans = await gymService.getGymMembershipPlans(gymId);
    
    res.status(200).json({
      status: 'success',
      results: plans.length,
      data: plans
    });
  }
};

module.exports = { gymController };