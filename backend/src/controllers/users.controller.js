const { userService } = require('../services/users.service');

const userController = {
  getProfile: async (req, res) => {
    const userId = req.user.id;
    const profile = await userService.getUserProfile(userId);
    
    res.status(200).json({
      status: 'success',
      data: profile
    });
  },
  
  updateProfile: async (req, res) => {
    const userId = req.user.id;
    const updateData = req.body;
    
    const updatedProfile = await userService.updateUserProfile(userId, updateData);
    
    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  },
  
  getWorkoutStats: async (req, res) => {
    const userId = req.user.id;
    const stats = await userService.getUserWorkoutStats(userId);
    
    res.status(200).json({
      status: 'success',
      data: stats
    });
  }
};

module.exports = { userController };