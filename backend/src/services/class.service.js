// src/services/class.service.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const classService = {
  getAllGymClasses: async ({ gymId, difficultyLevel, search, page = 1, limit = 10 }) => {
    const skip = (page - 1) * limit;
    
    // Build filter
    const filters = {
      isActive: true
    };
    
    if (gymId) {
      filters.gymId = gymId;
    }
    
    if (difficultyLevel) {
      filters.difficultyLevel = difficultyLevel;
    }
    
    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get total count
    const totalItems = await prisma.gymClass.count({
      where: filters
    });
    
    // Get paginated classes
    const classes = await prisma.gymClass.findMany({
      where: filters,
      include: {
        gym: {
          select: {
            id: true,
            name: true
          }
        },
        // Include the next few upcoming schedules
        schedules: {
          where: {
            startTime: {
              gte: new Date()
            },
            isCancelled: false
          },
          orderBy: {
            startTime: 'asc'
          },
          take: 5
        }
      },
      orderBy: [
        {
          gymId: 'asc'
        },
        {
          name: 'asc'
        }
      ],
      skip,
      take: limit
    });
    
    return {
      classes,
      totalItems,
      totalPages: Math.ceil(totalItems / limit)
    };
  },
  
  getGymClassById: async (classId) => {
    const gymClass = await prisma.gymClass.findUnique({
      where: { id: classId },
      include: {
        gym: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        // Include upcoming schedules
        schedules: {
          where: {
            startTime: {
              gte: new Date()
            },
            isCancelled: false
          },
          orderBy: {
            startTime: 'asc'
          },
          take: 10
        }
      }
    });
    
    if (!gymClass) {
      throw new ApiError(404, 'Class not found');
    }
    
    if (!gymClass.isActive) {
      throw new ApiError(410, 'This class is no longer available');
    }
    
    return gymClass;
  },
  
  getClassSchedules: async (classId, startDate, endDate) => {
    // Check if class exists
    const gymClass = await prisma.gymClass.findUnique({
      where: { id: classId },
      select: { id: true, isActive: true }
    });
    
    if (!gymClass) {
      throw new ApiError(404, 'Class not found');
    }
    
    if (!gymClass.isActive) {
      throw new ApiError(410, 'This class is no longer available');
    }
    
    // If no start date provided, use today
    if (!startDate) {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    }
    
    // If no end date provided, use one month from start date
    if (!endDate) {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    }
    
    // Get schedules for the class
    const schedules = await prisma.classSchedule.findMany({
      where: {
        classId,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        gymClass: {
          select: {
            name: true,
            maxCapacity: true,
            durationMinutes: true,
            membersOnly: true
          }
        },
        _count: {
          select: {
            userBookings: {
              where: {
                bookingStatus: {
                  in: ['confirmed']
                }
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });
    
    // Add availability status to each schedule
    const schedulesWithAvailability = schedules.map(schedule => {
      const maxCapacity = schedule.gymClass.maxCapacity || 0;
      const currentBookings = schedule._count.userBookings;
      const spotsAvailable = maxCapacity - currentBookings;
      
      return {
        ...schedule,
        spotsAvailable: Math.max(0, spotsAvailable),
        isFull: currentBookings >= maxCapacity,
        currentBookings
      };
    });
    
    return schedulesWithAvailability;
  }
};

module.exports = { classService };