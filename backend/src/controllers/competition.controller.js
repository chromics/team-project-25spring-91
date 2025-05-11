// src/controllers/competition.controller.js
const prisma = require('../config/prisma');
const { competitionService } = require('../services/competition.service');

const competitionController = {
  // Get all competitions
  getAllCompetitions: async (req, res) => {
    const { gymId, isActive, search, page = 1, limit = 10, includeEnded } = req.query;
    
    const competitionsData = await competitionService.getAllCompetitions({
      gymId,
      isActive: isActive !== undefined ? isActive === 'true' : true,
      search,
      page: parseInt(page),
      limit: parseInt(limit),
      includeEnded: includeEnded === 'true'
    });
    
    res.status(200).json({
      status: 'success',
      results: competitionsData.competitions.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: competitionsData.totalPages,
        totalItems: competitionsData.totalItems
      },
      data: competitionsData.competitions
    });
  },
  
  // Get competition by ID
  getCompetitionById: async (req, res) => {
    const competitionId = parseInt(req.params.id);
    const includeLeaderboard = req.query.includeLeaderboard === 'true';
    
    const competition = await competitionService.getCompetitionById(competitionId, includeLeaderboard);
    
    res.status(200).json({
      status: 'success',
      data: competition
    });
  },
  
  // Create a new competition
  createCompetition: async (req, res) => {
    // Check if user is gym owner or admin
    const userId = req.user.id;
    
    // Admin can create for any gym, gym owner only for their own gyms
    if (req.user.role === 'gym_owner') {
      // Check gym ownership
      const gymId = parseInt(req.body.gymId);
      const gym = await prisma.gym.findUnique({
        where: { id: gymId }
      });
      
      if (!gym || gym.ownerId !== userId) {
        throw new ApiError(403, 'You can only create competitions for gyms you own');
      }
    }
    
    const competition = await competitionService.createCompetition(req.body);
    
    res.status(201).json({
      status: 'success',
      message: 'Competition created successfully',
      data: competition
    });
  },
  
  // Update competition
  updateCompetition: async (req, res) => {
    const competitionId = parseInt(req.params.id);
    
    // If user is gym owner, verify ownership
    if (req.user.role === 'gym_owner') {
      const competition = await competitionService.getCompetitionById(competitionId);
      
      if (competition.gym.ownerId !== req.user.id) {
        throw new ApiError(403, 'You can only update competitions for gyms you own');
      }
    }
    
    const updatedCompetition = await competitionService.updateCompetition(competitionId, req.body);
    
    res.status(200).json({
      status: 'success',
      message: 'Competition updated successfully',
      data: updatedCompetition
    });
  },
  
  // Delete competition
  deleteCompetition: async (req, res) => {
    const competitionId = parseInt(req.params.id);
    
    // If user is gym owner, verify ownership
    if (req.user.role === 'gym_owner') {
      const competition = await competitionService.getCompetitionById(competitionId);
      
      if (competition.gym.ownerId !== req.user.id) {
        throw new ApiError(403, 'You can only delete competitions for gyms you own');
      }
    }
    
    await competitionService.deleteCompetition(competitionId);
    
    res.status(200).json({
      status: 'success',
      message: 'Competition deleted or deactivated successfully'
    });
  },
  
  // Create task for competition
  createTask: async (req, res) => {
    const competitionId = parseInt(req.params.id);
    
    // If user is gym owner, verify ownership
    if (req.user.role === 'gym_owner') {
      const competition = await competitionService.getCompetitionById(competitionId);
      
      if (competition.gym.ownerId !== req.user.id) {
        throw new ApiError(403, 'You can only add tasks to competitions for gyms you own');
      }
    }
    
    const task = await competitionService.createTask(competitionId, req.body);
    
    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: task
    });
  },
  
  // Update task
  updateTask: async (req, res) => {
    const taskId = parseInt(req.params.id);
    
    // If user is gym owner, verify ownership
    if (req.user.role === 'gym_owner') {
      const task = await prisma.competitionTask.findUnique({
        where: { id: taskId },
        include: {
          competition: {
            include: {
              gym: true
            }
          }
        }
      });
      
      if (!task || task.competition.gym.ownerId !== req.user.id) {
        throw new ApiError(403, 'You can only update tasks for competitions in gyms you own');
      }
    }
    
    const updatedTask = await competitionService.updateTask(taskId, req.body);
    
    res.status(200).json({
      status: 'success',
      message: 'Task updated successfully',
      data: updatedTask
    });
  },
  
  // Delete task
  deleteTask: async (req, res) => {
    const taskId = parseInt(req.params.id);
    
    // If user is gym owner, verify ownership
    if (req.user.role === 'gym_owner') {
      const task = await prisma.competitionTask.findUnique({
        where: { id: taskId },
        include: {
          competition: {
            include: {
              gym: true
            }
          }
        }
      });
      
      if (!task || task.competition.gym.ownerId !== req.user.id) {
        throw new ApiError(403, 'You can only delete tasks for competitions in gyms you own');
      }
    }
    
    await competitionService.deleteTask(taskId);
    
    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  },
  
  // Join competition
  joinCompetition: async (req, res) => {
    const competitionId = parseInt(req.params.id);
    const userId = req.user.id;
    
    const participation = await competitionService.joinCompetition(userId, competitionId);
    
    res.status(201).json({
      status: 'success',
      message: 'Successfully joined the competition',
      data: participation
    });
  },
  
  // Leave competition
  leaveCompetition: async (req, res) => {
    const competitionId = parseInt(req.params.id);
    const userId = req.user.id;
    
    await competitionService.leaveCompetition(userId, competitionId);
    
    res.status(200).json({
      status: 'success',
      message: 'Successfully left the competition'
    });
  },
  
  // Update task progress
  updateProgress: async (req, res) => {
    const taskId = parseInt(req.params.taskId);
    const userId = req.user.id;
    
    const updatedProgress = await competitionService.updateProgress(userId, taskId, req.body);
    
    res.status(200).json({
      status: 'success',
      message: 'Progress updated successfully',
      data: updatedProgress
    });
  },
  
  // Get competition leaderboard
  getLeaderboard: async (req, res) => {
    const competitionId = parseInt(req.params.id);
    const { limit = 10, page = 1 } = req.query;
    
    const leaderboardData = await competitionService.getLeaderboard(competitionId, {
      limit: parseInt(limit),
      page: parseInt(page)
    });
    
    res.status(200).json({
      status: 'success',
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: leaderboardData.totalPages,
        totalItems: leaderboardData.totalItems
      },
      data: leaderboardData
    });
  },
  
  // Get user's competitions
  getUserCompetitions: async (req, res) => {
    const userId = req.user.id;
    const { active = true, page = 1, limit = 10 } = req.query;
    
    const userCompetitions = await competitionService.getUserCompetitions(userId, {
      active: active === 'true',
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.status(200).json({
      status: 'success',
      results: userCompetitions.participations.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: userCompetitions.totalPages,
        totalItems: userCompetitions.totalItems
      },
      data: userCompetitions.participations
    });
  },
  
  // Get user's progress in a competition
  getUserProgress: async (req, res) => {
    const userId = req.user.id;
    const competitionId = parseInt(req.params.id);
    
    const progressData = await competitionService.getUserProgress(userId, competitionId);
    
    res.status(200).json({
      status: 'success',
      data: progressData
    });
  }
};

module.exports = { competitionController };