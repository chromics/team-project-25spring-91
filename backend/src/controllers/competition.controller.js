// src/controllers/competition.controller.js
const prisma = require('../config/prisma');
const { competitionService } = require('../services/competition.service');
const fs = require('fs').promises;
const path = require('path');
const { ApiError } = require('../utils/ApiError');

const competitionController = {
  // Get all competitions
  getAllCompetitions: async (req, res) => {
    const {
      gymId,
      isActive,
      search,
      page = 1,
      limit = 10,
      includeEnded,
    } = req.query;

    const competitionsData = await competitionService.getAllCompetitions({
      gymId,
      isActive: isActive !== undefined ? isActive === 'true' : true,
      search,
      page: parseInt(page),
      limit: parseInt(limit),
      includeEnded: includeEnded === 'true',
    });

    res.status(200).json({
      status: 'success',
      results: competitionsData.competitions.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: competitionsData.totalPages,
        totalItems: competitionsData.totalItems,
      },
      data: competitionsData.competitions,
    });
  },

  // Controller for discoverable competitions in subscribed gyms
  getDiscoverableCompetitionsForSubscribedGyms: async (req, res) => {
    const userId = req.user.id;
    const { isActive, search, page, limit, includeEnded } = req.query;
    const result =
      await competitionService.getDiscoverableCompetitionsForSubscribedGyms(
        userId,
        {
          isActive: isActive !== undefined ? isActive === 'true' : undefined, // Pass boolean or undefined
          search,
          page: page ? parseInt(page) : undefined,
          limit: limit ? parseInt(limit) : undefined,
          includeEnded: includeEnded === 'true',
        },
      );
    res.status(200).json({
      status: 'success',
      results: result.competitions.length,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
      },
      data: result.competitions,
    });
  },

  // Controller for joined competitions in subscribed gyms
  getJoinedCompetitionsForSubscribedGyms: async (req, res) => {
    const userId = req.user.id;
    const { isActiveCompetition, search, page, limit, includeEnded } =
      req.query;
    const result =
      await competitionService.getJoinedCompetitionsForSubscribedGyms(userId, {
        isActiveCompetition:
          isActiveCompetition !== undefined
            ? isActiveCompetition === 'true'
            : undefined,
        search,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        includeEnded: includeEnded === 'true',
      });
    res.status(200).json({
      status: 'success',
      results: result.participations.length,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
      },
      data: result.participations,
    });
  },

  // Get competition by ID
  getCompetitionById: async (req, res) => {
    const competitionId = parseInt(req.params.id);
    const includeLeaderboard = req.query.includeLeaderboard === 'true';

    const competition = await competitionService.getCompetitionById(
      competitionId,
      includeLeaderboard,
    );

    res.status(200).json({
      status: 'success',
      data: competition,
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
        where: { id: gymId },
      });

      if (!gym || gym.ownerId !== userId) {
        throw new ApiError(
          403,
          'You can only create competitions for gyms you own',
        );
      }
    }

    const competitionData = {
      ...req.body,
      imageUrl: req.processedImage ? req.processedImage.url : null,
    };

    const competition =
      await competitionService.createCompetition(competitionData);

    res.status(201).json({
      status: 'success',
      message: 'Competition created successfully',
      data: competition,
    });
  },

  // Update competition
  updateCompetition: async (req, res) => {
    const competitionId = parseInt(req.params.id);

    // If user is gym owner, verify ownership
    if (req.user.role === 'gym_owner') {
      const competition =
        await competitionService.getCompetitionById(competitionId);

      if (competition.gym.ownerId !== req.user.id) {
        throw new ApiError(
          403,
          'You can only update competitions for gyms you own',
        );
      }
    }

    // Prepare update data
    const updateData = { ...req.body };

    // If new image is uploaded, update imageUrl and delete old image
    if (req.processedImage) {
      // Get existing competition to access old image
      const existingCompetition = await prisma.competition.findUnique({
        where: { id: competitionId },
        select: { imageUrl: true },
      });

      // Delete old image if exists
      if (existingCompetition && existingCompetition.imageUrl) {
        try {
          const oldFilename = existingCompetition.imageUrl.split('/').pop();
          const oldFilepath = path.join(
            __dirname,
            '../../uploads/competitions',
            oldFilename,
          );
          await fs.unlink(oldFilepath);
        } catch (error) {
          console.log('Old image not found or already deleted');
        }
      }

      updateData.imageUrl = req.processedImage.url;
    }

    const updatedCompetition = await competitionService.updateCompetition(
      competitionId,
      updateData,
    );

    res.status(200).json({
      status: 'success',
      message: 'Competition updated successfully',
      data: updatedCompetition,
    });
  },
  // Delete competition
  deleteCompetition: async (req, res) => {
    const competitionId = parseInt(req.params.id);

    // Get existing competition
    const existingCompetition = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: { imageUrl: true, gym: { select: { ownerId: true } } },
    });

    if (!existingCompetition) {
      throw new ApiError(404, 'Competition not found');
    }

    // If user is gym owner, verify ownership
    if (req.user.role === 'gym_owner') {
      if (existingCompetition.gym.ownerId !== req.user.id) {
        throw new ApiError(
          403,
          'You can only delete competitions for gyms you own',
        );
      }
    }

    // Delete associated image if exists (before deleting the competition)
    if (existingCompetition.imageUrl) {
      try {
        const filename = existingCompetition.imageUrl.split('/').pop();
        const filepath = path.join(
          __dirname,
          '../../uploads/competitions',
          filename,
        );
        await fs.unlink(filepath);
      } catch (error) {
        console.log('Image not found or already deleted');
      }
    }

    await competitionService.deleteCompetition(competitionId);

    res.status(200).json({
      status: 'success',
      message: 'Competition deleted or deactivated successfully',
    });
  },

  // Create task for competition
  createTask: async (req, res) => {
    const competitionId = parseInt(req.params.id);

    // If user is gym owner, verify ownership
    if (req.user.role === 'gym_owner') {
      const competition =
        await competitionService.getCompetitionById(competitionId);

      if (competition.gym.ownerId !== req.user.id) {
        throw new ApiError(
          403,
          'You can only add tasks to competitions for gyms you own',
        );
      }
    }

    const task = await competitionService.createTask(competitionId, req.body);

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: task,
    });
  },

  getTasksByCompetitionId: async (req, res) => {
    const competitionId = parseInt(req.params.competitionId);
    const tasks =
      await competitionService.getTasksByCompetitionId(competitionId);
    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: tasks,
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
              gym: true,
            },
          },
        },
      });

      if (!task || task.competition.gym.ownerId !== req.user.id) {
        throw new ApiError(
          403,
          'You can only update tasks for competitions in gyms you own',
        );
      }
    }

    const updatedTask = await competitionService.updateTask(taskId, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Task updated successfully',
      data: updatedTask,
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
              gym: true,
            },
          },
        },
      });

      if (!task || task.competition.gym.ownerId !== req.user.id) {
        throw new ApiError(
          403,
          'You can only delete tasks for competitions in gyms you own',
        );
      }
    }

    await competitionService.deleteTask(taskId);

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
    });
  },

  // Join competition
  joinCompetition: async (req, res) => {
    const competitionId = parseInt(req.params.id);
    const userId = req.user.id;

    const participation = await competitionService.joinCompetition(
      userId,
      competitionId,
    );

    res.status(201).json({
      status: 'success',
      message: 'Successfully joined the competition',
      data: participation,
    });
  },

  // Leave competition
  leaveCompetition: async (req, res) => {
    const competitionId = parseInt(req.params.id);
    const userId = req.user.id;

    await competitionService.leaveCompetition(userId, competitionId);

    res.status(200).json({
      status: 'success',
      message: 'Successfully left the competition',
    });
  },

  // Update task progress
  updateProgress: async (req, res) => {
    const taskId = parseInt(req.params.taskId);
    const userId = req.user.id;

    const updatedProgress = await competitionService.updateProgress(
      userId,
      taskId,
      req.body,
    );

    res.status(200).json({
      status: 'success',
      message: 'Progress updated successfully',
      data: updatedProgress,
    });
  },

  // Get competition leaderboard
  getLeaderboard: async (req, res) => {
    const competitionId = parseInt(req.params.id);
    const { limit = 10, page = 1 } = req.query;

    const leaderboardData = await competitionService.getLeaderboard(
      competitionId,
      {
        limit: parseInt(limit),
        page: parseInt(page),
      },
    );

    res.status(200).json({
      status: 'success',
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: leaderboardData.totalPages,
        totalItems: leaderboardData.totalItems,
      },
      data: leaderboardData,
    });
  },

  // Get user's competitions
  getUserCompetitions: async (req, res) => {
    const userId = req.user.id;
    const { active = true, page = 1, limit = 10 } = req.query;

    const userCompetitions = await competitionService.getUserCompetitions(
      userId,
      {
        active: active === 'true',
        page: parseInt(page),
        limit: parseInt(limit),
      },
    );

    res.status(200).json({
      status: 'success',
      results: userCompetitions.participations.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: userCompetitions.totalPages,
        totalItems: userCompetitions.totalItems,
      },
      data: userCompetitions.participations,
    });
  },

  // Get user's progress in a competition
  getUserProgress: async (req, res) => {
    const userId = req.user.id;
    const competitionId = parseInt(req.params.id);

    const progressData = await competitionService.getUserProgress(
      userId,
      competitionId,
    );

    res.status(200).json({
      status: 'success',
      data: progressData,
    });
  },
};

module.exports = { competitionController };
