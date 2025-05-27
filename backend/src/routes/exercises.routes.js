// src/routes/exercises.routes.js
const express = require('express');
const { validate } = require('../middleware/validate');
const { exerciseController } = require('../controllers/exercises.controller');
const { exerciseSchemas } = require('../validators/exercises.validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { authMiddleware } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

// Public routes
router.get(
  '/',
  asyncHandler(exerciseController.getAllExercises)
);

router.get(
  '/:id',
  validate(exerciseSchemas.getExercise),
  asyncHandler(exerciseController.getExerciseById)
);

// Protected routes - only admins can create/update/delete exercises
router.post(
  '/',
  authMiddleware,
  roleCheck(['admin']), // Only admins can create exercises
  validate(exerciseSchemas.createExercise),
  asyncHandler(exerciseController.createExercise)
);

router.put(
  '/:id',
  authMiddleware,
  roleCheck(['admin']), // Only admins can update exercises
  validate(exerciseSchemas.updateExercise),
  asyncHandler(exerciseController.updateExercise)
);

router.delete(
  '/:id',
  authMiddleware,
  roleCheck(['admin']), // Only admins can delete exercises
  validate(exerciseSchemas.deleteExercise),
  asyncHandler(exerciseController.deleteExercise)
);

module.exports = router;