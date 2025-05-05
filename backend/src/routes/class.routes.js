const express = require('express');
const { validate } = require('../middleware/validate');
const { classController } = require('../controllers/class.controller');
const { classSchemas } = require('../validators/class.validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get(
  '/',
  asyncHandler(classController.getAllGymClasses)
);

router.get(
  '/:id',
  validate(classSchemas.getClass),
  asyncHandler(classController.getGymClassById)
);

// Protected routes
router.use(authMiddleware);

router.get(
  '/:id/schedules',
  validate(classSchemas.getClass),
  asyncHandler(classController.getClassSchedules)
);

module.exports = router;