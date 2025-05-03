// src/routes/gym.routes.js
const express = require('express');
const { validate } = require('../middleware/validate');
const { gymController } = require('../controllers/gym.controller');
const { gymSchemas } = require('../validators/gym.validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes (any users can get this)
router.get(
  '/',
  asyncHandler(gymController.getAllGyms)
);

router.get(
  '/:id',
  validate(gymSchemas.getGym),
  asyncHandler(gymController.getGymById)
);

// Protected routes - requiring authentication
router.use(authMiddleware);

router.get(
  '/:id/classes',
  validate(gymSchemas.getGym),
  asyncHandler(gymController.getGymClasses)
);

router.get(
  '/:id/membership-plans',
  validate(gymSchemas.getGym),
  asyncHandler(gymController.getGymMembershipPlans)
);

module.exports = router;