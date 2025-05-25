// src/routes/class.routes.js
const express = require('express');
const { validate } = require('../middleware/validate');
const { classController } = require('../controllers/class.controller');
const { classSchemas } = require('../validators/class.validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { authMiddleware } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { ownershipCheck } = require('../middleware/ownershipCheck');

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

// Admin and gym owner routes
router.post(
  '/',
  roleCheck(['admin', 'gym_owner']), // Admins and gym owners can create classes
  validate(classSchemas.createClass),
  asyncHandler(classController.createClass)
);

// Admin or resource owner only routes
router.put(
  '/:id',
  ownershipCheck('gymClass'), // Owner or admin can update class
  validate(classSchemas.updateClass),
  asyncHandler(classController.updateClass)
);

router.delete(
  '/:id',
  ownershipCheck('gymClass'), // Owner or admin can delete class
  validate(classSchemas.deleteClass),
  asyncHandler(classController.deleteClass)
);

// Schedule management
router.post(
  '/:id/schedules',
  ownershipCheck('gymClass'), // Owner or admin can add schedules
  validate(classSchemas.createSchedule),
  asyncHandler(classController.createClassSchedule)
);

router.put(
  '/schedules/:id',
  ownershipCheck('classSchedule'), // Owner or admin can update schedules
  validate(classSchemas.updateSchedule),
  asyncHandler(classController.updateClassSchedule)
);

router.delete(
  '/schedules/:id',
  ownershipCheck('classSchedule'), // Owner or admin can delete schedules
  validate(classSchemas.deleteSchedule),
  asyncHandler(classController.deleteClassSchedule)
);

module.exports = router;