// src/services/competition.service.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const competitionService = {
  // Get all competitions (with filtering options)
// Get all competitions (with filtering options)
getAllCompetitions: async ({ 
  gymId, 
  isActive = true, 
  search = '', 
  page = 1, 
  limit = 10,
  includeEnded = false
}) => {
  const where = {
    ...(gymId && { gymId: parseInt(gymId) }),
    ...(isActive !== undefined && { isActive }),
    ...(search && { 
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ] 
    }),
    ...(!includeEnded && { endDate: { gt: new Date() } })
  };

  // Get total count for pagination
  const totalItems = await prisma.competition.count({ where });
  const totalPages = Math.ceil(totalItems / limit);

  // Get competitions with pagination
  const competitions = await prisma.competition.findMany({
    where,
    orderBy: { startDate: 'desc' },
    skip: (page - 1) * limit,
    take: limit, // Changed from 'limit' to 'take'
    include: {
      gym: {
        select: {
          id: true,
          name: true,
          imageUrl: true
        }
      },
      _count: {
        select: {
          participants: true,
          competitionTasks: true
        }
      }
    }
  });

  return {
    competitions,
    totalItems,
    totalPages
  };
},

  // Get competition by ID
  getCompetitionById: async (competitionId, includeLeaderboard = false) => {
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        gym: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            ownerId: true
          }
        },
        competitionTasks: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                category: true,
                imageUrl: true
              }
            }
          }
        },
        _count: {
          select: {
            participants: true
          }
        }
      }
    });

    if (!competition) {
      throw new ApiError(404, 'Competition not found');
    }

    let leaderboard = [];
    if (includeLeaderboard) {
      leaderboard = await prisma.competitionUser.findMany({
        where: { 
          competitionId,
          isActive: true 
        },
        orderBy: [
          { completionPct: 'desc' },
          { totalPoints: 'desc' }
        ],
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              imageUrl: true
            }
          }
        }
      });
    }

    return {
      ...competition,
      leaderboard
    };
  },

  // Create a new competition
  createCompetition: async (data) => {
    // Check if gym exists
    const gym = await prisma.gym.findUnique({
      where: { id: data.gymId }
    });

    if (!gym) {
      throw new ApiError(404, 'Gym not found');
    }

    return prisma.competition.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
      }
    });
  },

  // Update competition
  updateCompetition: async (competitionId, data) => {
    // Check if competition exists
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId }
    });

    if (!competition) {
      throw new ApiError(404, 'Competition not found');
    }

    // Convert date strings to Date objects if present
    const updateData = {
      ...data,
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) })
    };

    return prisma.competition.update({
      where: { id: competitionId },
      data: updateData
    });
  },

  // Delete competition
  deleteCompetition: async (competitionId) => {
    // Check if competition exists
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        _count: {
          select: {
            participants: true
          }
        }
      }
    });

    if (!competition) {
      throw new ApiError(404, 'Competition not found');
    }

    // If there are participants, soft delete (set isActive to false)
    if (competition._count.participants > 0) {
      return prisma.competition.update({
        where: { id: competitionId },
        data: { isActive: false }
      });
    }

    // Otherwise, perform a hard delete
    return prisma.competition.delete({
      where: { id: competitionId }
    });
  },

  // Create a task for a competition
  createTask: async (competitionId, taskData) => {
    // Check if competition exists
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId }
    });

    if (!competition) {
      throw new ApiError(404, 'Competition not found');
    }

    // If exercise ID is provided, check if it exists
    if (taskData.exerciseId) {
      const exercise = await prisma.exercise.findUnique({
        where: { id: taskData.exerciseId }
      });

      if (!exercise) {
        throw new ApiError(404, 'Exercise not found');
      }
    }

    // Create the task
    const task = await prisma.competitionTask.create({
      data: {
        ...taskData,
        competitionId
      }
    });

    // Create progress records for all participants
    const participants = await prisma.competitionUser.findMany({
      where: { competitionId }
    });

    if (participants.length > 0) {
      await prisma.competitionProgress.createMany({
        data: participants.map(participant => ({
          participantId: participant.id,
          taskId: task.id,
          currentValue: 0,
          isCompleted: false
        }))
      });
    }

    return task;
  },

  // Update a task
  updateTask: async (taskId, taskData) => {
    // Check if task exists
    const task = await prisma.competitionTask.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    return prisma.competitionTask.update({
      where: { id: taskId },
      data: taskData
    });
  },

  // Delete a task
  deleteTask: async (taskId) => {
    // Check if task exists
    const task = await prisma.competitionTask.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    return prisma.competitionTask.delete({
      where: { id: taskId }
    });
  },

  // User joins a competition
  joinCompetition: async (userId, competitionId) => {
    // Check if competition exists and is active
    const competition = await prisma.competition.findFirst({
      where: { 
        id: competitionId,
        isActive: true,
        endDate: { gt: new Date() }
      },
      include: {
        competitionTasks: true,
        _count: {
          select: { participants: true }
        }
      }
    });

    if (!competition) {
      throw new ApiError(404, 'Active competition not found');
    }

    // Check if max participants reached
    if (competition.maxParticipants && 
        competition._count.participants >= competition.maxParticipants) {
      throw new ApiError(400, 'Competition has reached maximum participants');
    }

    // Check if user is already a participant
    const existingParticipant = await prisma.competitionUser.findFirst({
      where: {
        userId,
        competitionId
      }
    });

    if (existingParticipant) {
      // If user previously left, reactivate their participation
      if (!existingParticipant.isActive) {
        return prisma.competitionUser.update({
          where: { id: existingParticipant.id },
          data: { isActive: true }
        });
      }
      throw new ApiError(400, 'User is already participating in this competition');
    }

    // Create participant record
    const participant = await prisma.competitionUser.create({
      data: {
        userId,
        competitionId,
        joinDate: new Date(),
        totalPoints: 0,
        completionPct: 0,
        isActive: true
      }
    });

    // Create progress records for all tasks
    if (competition.competitionTasks.length > 0) {
      await prisma.competitionProgress.createMany({
        data: competition.competitionTasks.map(task => ({
          participantId: participant.id,
          taskId: task.id,
          currentValue: 0,
          isCompleted: false
        }))
      });
    }

    return participant;
  },

  // User leaves a competition
  leaveCompetition: async (userId, competitionId) => {
    // Find participant
    const participant = await prisma.competitionUser.findFirst({
      where: {
        userId,
        competitionId,
        isActive: true
      }
    });

    if (!participant) {
      throw new ApiError(404, 'Active participation not found');
    }

    // Set isActive to false (soft delete)
    return prisma.competitionUser.update({
      where: { id: participant.id },
      data: { isActive: false }
    });
  },

  // Update progress for a task
  updateProgress: async (userId, taskId, progressData) => {
    // Find the task
    const task = await prisma.competitionTask.findUnique({
      where: { id: taskId },
      include: { competition: true }
    });

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Find the participant
    const participant = await prisma.competitionUser.findFirst({
      where: {
        userId,
        competitionId: task.competitionId,
        isActive: true
      }
    });

    if (!participant) {
      throw new ApiError(404, 'User is not an active participant in this competition');
    }

    // Check if competition is still active
    if (!task.competition.isActive || task.competition.endDate < new Date()) {
      throw new ApiError(400, 'Competition has ended or is no longer active');
    }

    // Find existing progress record
    const progressRecord = await prisma.competitionProgress.findUnique({
      where: {
        participantId_taskId: {
          participantId: participant.id,
          taskId
        }
      }
    });

    if (!progressRecord) {
      throw new ApiError(404, 'Progress record not found');
    }

    // Determine if the task is completed based on current value and target
    const isCompleted = progressData.isCompleted || 
                       (progressData.currentValue >= task.targetValue);
    
    // Update progress
    const updatedProgress = await prisma.competitionProgress.update({
      where: { id: progressRecord.id },
      data: {
        currentValue: progressData.currentValue,
        isCompleted,
        ...(isCompleted && !progressRecord.isCompleted && { 
          completionDate: new Date() 
        }),
        notes: progressData.notes,
        lastUpdated: new Date()
      }
    });

    // Recalculate user's overall progress and points
    await competitionService.recalculateUserProgress(participant.id);

    return updatedProgress;
  },

  // Recalculate user's overall progress and ranking
  recalculateUserProgress: async (participantId) => {
    // Get participant
    const participant = await prisma.competitionUser.findUnique({
      where: { id: participantId },
      include: {
        taskProgress: {
          include: {
            task: true
          }
        }
      }
    });

    if (!participant) {
      throw new ApiError(404, 'Participant not found');
    }

    // Calculate total points and completion percentage
    let totalPoints = 0;
    let completedTasks = 0;
    
    participant.taskProgress.forEach(progress => {
      if (progress.isCompleted) {
        totalPoints += progress.task.pointsValue;
        completedTasks++;
      } else {
        // Partial points based on progress percentage
        const progressPct = Number(progress.currentValue) / Number(progress.task.targetValue);
        if (progressPct > 0 && progressPct < 1) {
          totalPoints += Math.floor(progress.task.pointsValue * progressPct);
        }
      }
    });

    const completionPct = participant.taskProgress.length > 0
      ? (completedTasks / participant.taskProgress.length) * 100
      : 0;

    // Update participant record
    await prisma.competitionUser.update({
      where: { id: participantId },
      data: {
        totalPoints,
        completionPct
      }
    });

    // Update rankings for all participants in the competition
    await competitionService.updateCompetitionRankings(participant.competitionId);
  },

  // Update competition rankings
  updateCompetitionRankings: async (competitionId) => {
    // Get all active participants ordered by completion and points
    const participants = await prisma.competitionUser.findMany({
      where: {
        competitionId,
        isActive: true
      },
      orderBy: [
        { completionPct: 'desc' },
        { totalPoints: 'desc' }
      ]
    });

    // Update rank for each participant
    for (let i = 0; i < participants.length; i++) {
      await prisma.competitionUser.update({
        where: { id: participants[i].id },
        data: { rank: i + 1 }
      });
    }
  },

  // Get competition leaderboard
  getLeaderboard: async (competitionId, { limit = 10, page = 1 }) => {
    // Check if competition exists
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId }
    });

    if (!competition) {
      throw new ApiError(404, 'Competition not found');
    }

    // Get total count for pagination
    const totalItems = await prisma.competitionUser.count({
      where: {
        competitionId,
        isActive: true
      }
    });
    
    const totalPages = Math.ceil(totalItems / limit);

    // Get participants ordered by rank
    const leaderboard = await prisma.competitionUser.findMany({
      where: {
        competitionId,
        isActive: true
      },
      orderBy: { rank: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            imageUrl: true
          }
        },
        _count: {
          select: {
            taskProgress: {
              where: {
                isCompleted: true
              }
            }
          }
        }
      }
    });

    return {
      competition: {
        id: competition.id,
        name: competition.name,
        startDate: competition.startDate,
        endDate: competition.endDate,
        isActive: competition.isActive
      },
      leaderboard,
      totalItems,
      totalPages,
      page,
      limit
    };
  },

  // Get user's competitions
  getUserCompetitions: async (userId, { active = true, page = 1, limit = 10 }) => {
    const where = {
      userId,
      ...(active && { isActive: true })
    };

    // Get total count for pagination
    const totalItems = await prisma.competitionUser.count({ where });
    const totalPages = Math.ceil(totalItems / limit);

    // Get user's competitions
    const participations = await prisma.competitionUser.findMany({
      where,
      orderBy: { joinDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        competition: {
          include: {
            gym: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            }
          }
        },
        _count: {
          select: {
            taskProgress: {
              where: {
                isCompleted: true
              }
            }
          }
        }
      }
    });

    return {
      participations,
      totalItems,
      totalPages
    };
  },

  // Get user's progress in a competition
  getUserProgress: async (userId, competitionId) => {
    // Find participant
    const participant = await prisma.competitionUser.findFirst({
      where: {
        userId,
        competitionId
      },
      include: {
        competition: {
          include: {
            gym: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    if (!participant) {
      throw new ApiError(404, 'Participation not found');
    }

    // Get tasks and progress
    const tasksWithProgress = await prisma.competitionTask.findMany({
      where: { competitionId },
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            category: true,
            imageUrl: true
          }
        },
        userProgress: {
          where: { participantId: participant.id }
        }
      }
    });

    return {
      participant,
      tasks: tasksWithProgress.map(task => ({
        ...task,
        progress: task.userProgress[0] || null
      }))
    };
  }
};

module.exports = { competitionService };