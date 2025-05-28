//src/controllers/users.controller.js
const { userService } = require('../services/users.service');
const fs = require('fs').promises;
const path = require('path');

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
    
    // Prepare update data
    const updateData = { ...req.body };
    
    // If new image is uploaded, add it to update data
    if (req.processedImage) {
      // Get current user to delete old image
      const currentUser = await userService.getUserProfile(userId);
      
      // Delete old image if exists
      if (currentUser.imageUrl) {
        try {
          const oldFilename = currentUser.imageUrl.split('/').pop();
          const oldFilepath = path.join(__dirname, '../../uploads/users', oldFilename);
          await fs.unlink(oldFilepath);
        } catch (error) {
          console.log('Old image not found or already deleted');
        }
      }
      
      updateData.imageUrl = req.processedImage.url;
    }
    
    const updatedProfile = await userService.updateUserProfile(userId, updateData);
    
    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  },

    updateProfileImage: async (req, res) => {
    const userId = req.user.id;
    
    if (!req.processedImage) {
      throw new ApiError(400, 'Image file is required');
    }
    
    // Get current user to delete old image
    const currentUser = await userService.getUserProfile(userId);
    
    // Delete old image if exists
    if (currentUser.imageUrl) {
      try {
        const oldFilename = currentUser.imageUrl.split('/').pop();
        const oldFilepath = path.join(__dirname, '../../uploads/users', oldFilename);
        await fs.unlink(oldFilepath);
      } catch (error) {
        console.log('Old image not found or already deleted');
      }
    }
    
    // Update user with new image URL
    const updatedProfile = await userService.updateUserProfile(userId, {
      imageUrl: req.processedImage.url
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Profile image updated successfully',
      data: {
        imageUrl: updatedProfile.imageUrl
      }
    });
  },

    getAllUsers: async (req, res) => {
    const { page = 1, limit = 20, role, search } = req.query;
    
    const result = await userService.getAllUsers(
      parseInt(page),
      parseInt(limit),
      { role, search }
    );
    
    res.status(200).json({
      status: 'success',
      results: result.users.length,
      pagination: result.pagination,
      data: result.users
    });
  },

    changeUserRole: async (req, res) => {
    const adminId = req.user.id;
    const targetUserId = parseInt(req.params.id);
    const { role } = req.body;
    
    const updatedUser = await userService.changeUserRole(adminId, targetUserId, role);
    
    res.status(200).json({
      status: 'success',
      message: 'User role updated successfully',
      data: updatedUser
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