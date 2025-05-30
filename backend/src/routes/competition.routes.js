// src/routes/competition.routes.js
const express = require('express');
const { validate } = require('../middleware/validate');
const { competitionController } = require('../controllers/competition.controller');
const { competitionSchemas } = require('../validators/competition.validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { authMiddleware } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { ownershipCheck } = require('../middleware/ownershipCheck');
const { uploadCompetitionImage, processCompetitionImage } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get(
  '/',
  asyncHandler(competitionController.getAllCompetitions)
);

router.get(
  '/:id',
  validate(competitionSchemas.getCompetition),
  asyncHandler(competitionController.getCompetitionById)
);

router.get(
  '/:id/leaderboard',
  validate(competitionSchemas.getLeaderboard),
  asyncHandler(competitionController.getLeaderboard)
);

router.get(
  '/:competitionId/tasks-list', // Distinct path
  validate(competitionSchemas.getCompetitionTasks),
  asyncHandler(competitionController.getTasksByCompetitionId),
);

// Protected routes - require authentication
router.use(authMiddleware);

// New User Route: Discoverable competitions from subscribed gyms (not yet joined)
router.get(
  '/user/discover-subscribed-gym-competitions',
  validate(competitionSchemas.listUserCompetitionView),
  asyncHandler(competitionController.getDiscoverableCompetitionsForSubscribedGyms),
);

// New User Route: Joined competitions from subscribed gyms
router.get(
  '/user/joined-subscribed-gym-competitions',
  validate(competitionSchemas.listUserCompetitionView),
  asyncHandler(competitionController.getJoinedCompetitionsForSubscribedGyms),
);

// User actions for competitions
router.post(
  '/:id/join',
  validate(competitionSchemas.joinCompetition),
  asyncHandler(competitionController.joinCompetition)
);

router.delete(
  '/:id/leave',
  validate(competitionSchemas.joinCompetition), // Reuse the same schema
  asyncHandler(competitionController.leaveCompetition)
);

router.put(
  '/tasks/:taskId/progress',
  validate(competitionSchemas.updateProgress),
  asyncHandler(competitionController.updateProgress)
);

router.get(
  '/user/competitions',
  asyncHandler(competitionController.getUserCompetitions)
);

router.get(
  '/user/competitions/:id/progress',
  validate(competitionSchemas.getCompetition),
  asyncHandler(competitionController.getUserProgress)
);

// Admin and gym owner routes
router.post(
  '/',
  roleCheck(['admin', 'gym_owner']),
  uploadCompetitionImage,
  processCompetitionImage,
  validate(competitionSchemas.createCompetition),
  asyncHandler(competitionController.createCompetition)
);

router.put(
  '/:id',
  roleCheck(['admin', 'gym_owner']),
  uploadCompetitionImage,
  processCompetitionImage,
  validate(competitionSchemas.updateCompetition),
  asyncHandler(competitionController.updateCompetition)
);

router.delete(
  '/:id',
  roleCheck(['admin', 'gym_owner']),
  validate(competitionSchemas.getCompetition),
  asyncHandler(competitionController.deleteCompetition)
);

// Competition task management
router.post(
  '/:id/tasks',
  roleCheck(['admin', 'gym_owner']),
  validate(competitionSchemas.createTask),
  asyncHandler(competitionController.createTask)
);

router.put(
  '/tasks/:id',
  roleCheck(['admin', 'gym_owner']),
  validate(competitionSchemas.updateTask),
  asyncHandler(competitionController.updateTask)
);

router.delete(
  '/tasks/:id',
  roleCheck(['admin', 'gym_owner']),
  validate(competitionSchemas.getCompetition), // Reuse the same schema
  asyncHandler(competitionController.deleteTask)
);

module.exports = router;