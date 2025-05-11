// src/controllers/gym.controller.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

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
  
  // First check if gym exists
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
  
  // First check if gym exists
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
  
  // Create gym with the current user as owner if they're a gym_owner
  // Admins can create gyms without being assigned as owner
  const ownerId = req.user.role === 'gym_owner' ? userId : null;
  
  const gymData = {
    ...req.body,
    ownerId
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
  
  // First check if gym exists
  const gym = await prisma.gym.findUnique({
    where: { id: gymId }
  });
  
  if (!gym) {
    throw new ApiError(404, 'Gym not found');
  }
  
  // Update gym
  const updatedGym = await prisma.gym.update({
    where: { id: gymId },
    data: req.body
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Gym updated successfully',
    data: updatedGym
  });
};

const deleteGym = async (req, res) => {
  const gymId = parseInt(req.params.id);
  
  // First check if gym exists
  const gym = await prisma.gym.findUnique({
    where: { id: gymId }
  });
  
  if (!gym) {
    throw new ApiError(404, 'Gym not found');
  }
  
  // Delete gym
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