const { statisticsService } = require('../services/statistics.service');

const statisticsController = {
  // Get dashboard statistics
  getDashboardStatistics: async (req, res) => {
    const userId = req.user.id;
    const statistics = await statisticsService.getDashboardStatistics(userId);
    
    res.status(200).json({
      status: 'success',
      data: statistics
    });
  },
  
  // Getting exercise progress for a specific exercise
  getExerciseProgress: async (req, res) => {
    const userId = req.user.id;
    const exerciseId = parseInt(req.params.exerciseId);
    
    const progress = await statisticsService.getExerciseProgress(userId, exerciseId);
    
    res.status(200).json({
      status: 'success',
      data: progress
    });
  }
};

module.exports = { statisticsController };