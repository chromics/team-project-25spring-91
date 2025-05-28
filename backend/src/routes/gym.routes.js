// src/routes/gym.routes.js
const express = require('express');
const { validate } = require('../middleware/validate');
const { gymController } = require('../controllers/gym.controller');
const { gymSchemas } = require('../validators/gym.validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { authMiddleware } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { ownershipCheck } = require('../middleware/ownershipCheck');
const { uploadGymImage, processGymImage } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get(
  '/',
  asyncHandler(gymController.getAllGyms)
);

router.get(
  '/:id',
  validate(gymSchemas.getGym),
  asyncHandler(gymController.getGymById)
);

// Protected routes
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

// Admin and gym owner only routes
router.post(
  '/',
  roleCheck(['admin', 'gym_owner']),
  uploadGymImage,
  processGymImage,
  validate(gymSchemas.createGym),
  asyncHandler(gymController.createGym)
);

// Admin or resource owner only routes
router.put(
  '/:id',
  ownershipCheck('gym'),
  uploadGymImage,
  processGymImage,
  validate(gymSchemas.updateGym),
  asyncHandler(gymController.updateGym)
);

router.delete(
  '/:id',
  roleCheck(['admin']),
  validate(gymSchemas.deleteGym),
  asyncHandler(gymController.deleteGym)
);

module.exports = router;