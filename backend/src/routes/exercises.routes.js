const express = require('express');
const { validate } = require('../middleware/validate');
const { exerciseController } = require('../controllers/exercises.controller');
const { exerciseSchemas } = require('../controllers/exercises.validator');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(exerciseController.getAllExercises)
);

router.get(
  '/:id',
  validate(exerciseSchemas.getExercise),
  asyncHandler(exerciseController.getExerciseById)
);

router.post(
  '/',
  validate(exerciseSchemas.createExercise),
  asyncHandler(exerciseController.createExercise)
);

router.put(
  '/:id',
  validate(exerciseSchemas.updateExercise),
  asyncHandler(exerciseController.updateExercise)
);

router.delete(
  '/:id',
  validate(exerciseSchemas.deleteExercise),
  asyncHandler(exerciseController.deleteExercise)
);

module.exports = router;