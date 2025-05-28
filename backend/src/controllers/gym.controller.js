// src/controllers/gym.controller.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const fs = require('fs').promises;
const path = require('path');

const getAllGyms = async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  
  const gymsData = await prisma.gym.findMany({
    where: search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    } : undefined,
    take: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit),
    orderBy: { name: 'asc' }
  });
  
  const totalItems = await prisma.gym.count({
    where: search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    } : undefined
  });
  
  res.status(200).json({
    status: 'success',
    results: gymsData.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalItems / parseInt(limit)),
      totalItems
    },
    data: gymsData
  });
};

const getGymById = async (req, res) => {
  const gymId = parseInt(req.params.id);
  
  const gym = await prisma.gym.findUnique({
    where: { id: gymId }
  });
  
  if (!gym) {
    throw new ApiError(404, 'Gym not found');
  }
  
  res.status(200).json({
    status: 'success',
    data: gym
  });
};

const getGymClasses = async (req, res) => {
  const gymId = parseInt(req.params.id);
  
  const gym = await prisma.gym.findUnique({
    where: { id: gymId }
  });
  
  if (!gym) {
    throw new ApiError(404, 'Gym not found');
  }
  
  const classes = await prisma.gymClass.findMany({
    where: {
      gymId,
      isActive: true
    }
  });
  
  res.status(200).json({
    status: 'success',
    results: classes.length,
    data: classes
  });
};

const getGymMembershipPlans = async (req, res) => {
  const gymId = parseInt(req.params.id);
  
  const gym = await prisma.gym.findUnique({
    where: { id: gymId }
  });
  
  if (!gym) {
    throw new ApiError(404, 'Gym not found');
  }
  
  const plans = await prisma.membershipPlan.findMany({
    where: {
      gymId,
      isActive: true
    }
  });
  
  res.status(200).json({
    status: 'success',
    results: plans.length,
    data: plans
  });
};

const createGym = async (req, res) => {
  const userId = req.user.id;
  
  const ownerId = req.user.role === 'gym_owner' ? userId : null;
  
  const gymData = {
    ...req.body,
    ownerId,
    imageUrl: req.processedImage ? req.processedImage.url : null
  };
  
  const newGym = await prisma.gym.create({
    data: gymData
  });
  
  res.status(201).json({
    status: 'success',
    message: 'Gym created successfully',
    data: newGym
  });
};

const updateGym = async (req, res) => {
  const gymId = parseInt(req.params.id);
  
  const gym = await prisma.gym.findUnique({
    where: { id: gymId }
  });
  
  if (!gym) {
    throw new ApiError(404, 'Gym not found');
  }
  
  // Prepare update data
  const updateData = { ...req.body };
  
  // If new image is uploaded, update imageUrl and delete old image
  if (req.processedImage) {
    // Delete old image if exists
    if (gym.imageUrl) {
      try {
        const oldFilename = gym.imageUrl.split('/').pop();
        const oldFilepath = path.join(__dirname, '../../uploads/gyms', oldFilename);
        await fs.unlink(oldFilepath);
      } catch (error) {
        console.log('Old image not found or already deleted');
      }
    }
    
    updateData.imageUrl = req.processedImage.url;
  }
  
  const updatedGym = await prisma.gym.update({
    where: { id: gymId },
    data: updateData
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Gym updated successfully',
    data: updatedGym
  });
};

const deleteGym = async (req, res) => {
  const gymId = parseInt(req.params.id);
  
  const gym = await prisma.gym.findUnique({
    where: { id: gymId }
  });
  
  if (!gym) {
    throw new ApiError(404, 'Gym not found');
  }
  
  // Delete associated image if exists
  if (gym.imageUrl) {
    try {
      const filename = gym.imageUrl.split('/').pop();
      const filepath = path.join(__dirname, '../../uploads/gyms', filename);
      await fs.unlink(filepath);
    } catch (error) {
      console.log('Image not found or already deleted');
    }
  }
  
  await prisma.gym.delete({
    where: { id: gymId }
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Gym deleted successfully'
  });
};

const gymController = {
  getAllGyms,
  getGymById,
  getGymClasses,
  getGymMembershipPlans,
  createGym,
  updateGym,
  deleteGym
};

module.exports = { gymController };