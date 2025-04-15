const express = require('express');
const { validate } = require('../middleware/validate');
const { statisticsController } = require('../controllers/statistics.controller');
const { statisticsSchemas } = require('../controllers/statistics.validator');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/dashboard',
  asyncHandler(statisticsController.getDashboardStatistics)
);

router.get(
  '/exercise/:exerciseId',
  validate(statisticsSchemas.getExerciseProgress),
  asyncHandler(statisticsController.getExerciseProgress)
);

module.exports = router;