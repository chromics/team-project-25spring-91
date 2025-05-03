// src/services/gym.service.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const gymService = {
  getAllGyms: async ({ search, page = 1, limit = 10 }) => {
    const skip = (page - 1) * limit;
    
    // Build filter
    const filters = {};
    
    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get total count
    const totalItems = await prisma.gym.count({
      where: filters
    });
    
    // Get paginated gyms
    const gyms = await prisma.gym.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        address: true,
        description: true,
        contactInfo: true,
        imageUrl: true,
        createdAt: true,
        _count: {
          select: {
            classes: true,
            membershipPlans: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      skip,
      take: limit
    });
    
    return {
      gyms,
      totalItems,
      totalPages: Math.ceil(totalItems / limit)
    };
  },
  
  getGymById: async (gymId) => {
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      select: {
        id: true,
        name: true,
        address: true,
        description: true,
        contactInfo: true,
        imageUrl: true,
        createdAt: true,
        _count: {
          select: {
            classes: true,
            membershipPlans: true
          }
        }
      }
    });
    
    if (!gym) {
      throw new ApiError(404, 'Gym not found');
    }
    
    return gym;
  },
  
  getGymClasses: async (gymId) => {
    // Check if gym exists
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      select: { id: true }
    });
    
    if (!gym) {
      throw new ApiError(404, 'Gym not found');
    }
    
    // Get classes
    const classes = await prisma.gymClass.findMany({
      where: { 
        gymId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        maxCapacity: true,
        durationMinutes: true,
        imageUrl: true,
        membersOnly: true,
        difficultyLevel: true,
        createdAt: true,
        gym: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return classes;
  },
  
  getGymMembershipPlans: async (gymId) => {
    // Check if gym exists
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      select: { id: true }
    });
    
    if (!gym) {
      throw new ApiError(404, 'Gym not found');
    }
    
    // Get membership plans
    const plans = await prisma.membershipPlan.findMany({
      where: {
        gymId,
        isActive: true
      },
      orderBy: {
        price: 'asc'
      }
    });
    
    return plans;
  }
};

module.exports = { gymService };