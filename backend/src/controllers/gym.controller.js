// src/controllers/gym.controller.js
const prisma = require('../config/prisma'); // Keep for direct prisma use if any
const { gymService } = require('../services/gym.service'); // Import the service
const { ApiError } = require('../utils/ApiError');
const fs = require('fs').promises;
const path = require('path');

const getAllGyms = async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const result = await gymService.getAllGyms({
    search,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.status(200).json({
    status: 'success',
    results: result.gyms.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: result.totalPages,
      totalItems: result.totalItems,
    },
    data: result.gyms,
  });
};

// New controller for admins to get all gyms
const getAllGymsAdmin = async (req, res) => {
  const gyms = await gymService.getAllGymsAdmin();
  res.status(200).json({
    status: 'success',
    results: gyms.length,
    data: gyms,
  });
};

// New controller for gym owners to get their gyms
const getMyGyms = async (req, res) => {
  const ownerId = req.user.id;
  const { search, page = 1, limit = 10 } = req.query;

  const result = await gymService.getMyGyms({
    ownerId,
    search,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.status(200).json({
    status: 'success',
    results: result.gyms.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: result.totalPages,
      totalItems: result.totalItems,
    },
    data: result.gyms,
  });
};

const getGymById = async (req, res) => {
  const gymId = parseInt(req.params.id);
  const gym = await gymService.getGymById(gymId); // Use service
  res.status(200).json({
    status: 'success',
    data: gym,
  });
};

const getGymClasses = async (req, res) => {
  const gymId = parseInt(req.params.id);
  const classes = await gymService.getGymClasses(gymId); // Use service
  res.status(200).json({
    status: 'success',
    results: classes.length,
    data: classes,
  });
};

const getGymMembershipPlans = async (req, res) => {
  const gymId = parseInt(req.params.id);
  const plans = await gymService.getGymMembershipPlans(gymId); // Use service
  res.status(200).json({
    status: 'success',
    results: plans.length,
    data: plans,
  });
};

const createGym = async (req, res) => {
  const userId = req.user.id;
  // Assign ownerId if the user creating is a 'gym_owner' or 'admin'
  // Admins can create gyms and assign them, or create unassigned ones.
  // Gym owners create gyms for themselves.
  let ownerIdToSet = null;
  if (req.user.role === 'gym_owner') {
    ownerIdToSet = userId;
  } else if (req.user.role === 'admin' && req.body.ownerId) {
    // Admin can optionally specify an ownerId
    ownerIdToSet = parseInt(req.body.ownerId);
  } else if (req.user.role === 'admin' && !req.body.ownerId) {
    // Admin creates a gym, could be unassigned or assigned to self if desired
    // For now, let's make it assign to self if no ownerId is provided by admin
    ownerIdToSet = userId; // Or keep null if admin-created gyms can be unowned
  }


  const gymData = {
    ...req.body,
    ownerId: ownerIdToSet,
    imageUrl: req.processedImage ? req.processedImage.url : null,
  };

  // Ensure ownerId is not part of req.body if user is gym_owner to avoid conflict
  if (req.user.role === 'gym_owner') {
    delete gymData.ownerId; // ownerIdToSet will handle this
    gymData.ownerId = userId;
  }


  const newGym = await prisma.gym.create({
    data: gymData,
  });

  res.status(201).json({
    status: 'success',
    message: 'Gym created successfully',
    data: newGym,
  });
};

const updateGym = async (req, res) => {
  const gymId = parseInt(req.params.id);

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
  });

  if (!gym) {
    throw new ApiError(404, 'Gym not found');
  }

  const updateData = { ...req.body };

  if (req.processedImage) {
    if (gym.imageUrl) {
      try {
        const oldFilename = gym.imageUrl.split('/').pop();
        const oldFilepath = path.join(
          __dirname,
          '../../uploads/gyms',
          oldFilename,
        );
        await fs.unlink(oldFilepath);
      } catch (error) {
        console.log('Old image not found or already deleted:', error.message);
      }
    }
    updateData.imageUrl = req.processedImage.url;
  }

  // Prevent gym_owner from changing ownerId
  if (req.user.role === 'gym_owner' && updateData.ownerId) {
    delete updateData.ownerId;
  }


  const updatedGym = await prisma.gym.update({
    where: { id: gymId },
    data: updateData,
  });

  res.status(200).json({
    status: 'success',
    message: 'Gym updated successfully',
    data: updatedGym,
  });
};

const deleteGym = async (req, res) => {
  const gymId = parseInt(req.params.id);

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
  });

  if (!gym) {
    throw new ApiError(404, 'Gym not found');
  }

  if (gym.imageUrl) {
    try {
      const filename = gym.imageUrl.split('/').pop();
      const filepath = path.join(__dirname, '../../uploads/gyms', filename);
      await fs.unlink(filepath);
    } catch (error) {
      console.log('Image not found or already deleted:', error.message);
    }
  }

  await prisma.gym.delete({
    where: { id: gymId },
  });

  res.status(200).json({
    status: 'success',
    message: 'Gym deleted successfully',
  });
};

const gymController = {
  getAllGyms,
  getAllGymsAdmin, // Export new controller
  getMyGyms, // Export new controller
  getGymById,
  getGymClasses,
  getGymMembershipPlans,
  createGym,
  updateGym,
  deleteGym,
};

module.exports = { gymController };
