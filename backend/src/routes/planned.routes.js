const express = require('express');
const { validate } = require('../middleware/validate');
const { plannedController } = require('../controllers/planned.controller');
const { plannedSchemas } = require('../controllers/planned.validator');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(plannedController.getAllPlannedWorkouts)
);

router.get(
  '/upcoming',
  asyncHandler(plannedController.getUpcomingWorkouts)
);


router.get(
  '/:id',
  validate(plannedSchemas.getPlannedWorkout),
  asyncHandler(plannedController.getPlannedWorkoutById)
);

router.post(
  '/',
  validate(plannedSchemas.createPlannedWorkout),
  asyncHandler(plannedController.createPlannedWorkout)
);

router.put(
  '/:id',
  validate(plannedSchemas.updatePlannedWorkout),
  asyncHandler(plannedController.updatePlannedWorkout)
);

router.delete(
  '/:id',
  validate(plannedSchemas.deletePlannedWorkout),
  asyncHandler(plannedController.deletePlannedWorkout)
);

module.exports = router;