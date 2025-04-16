const express = require('express');
const { validate } = require('../middleware/validate');
const { userController } = require('../controllers/users.controller');
const { userSchemas } = require('../controllers/users.validator');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/profile',
  asyncHandler(userController.getProfile)
);

router.put(
  '/profile',
  validate(userSchemas.updateProfile),
  asyncHandler(userController.updateProfile)
);

// router.get(
//   '/stats',
//   asyncHandler(userController.getWorkoutStats)
// );

module.exports = router;