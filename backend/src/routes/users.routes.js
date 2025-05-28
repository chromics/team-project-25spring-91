// src/routes/users.routes.js
const express = require('express');
const { validate } = require('../middleware/validate');
const { userController } = require('../controllers/users.controller');
const { userSchemas } = require('../validators/users.validator');
const { authMiddleware } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { roleCheck } = require('../middleware/roleCheck');
const { uploadUserImage, processUserImage } = require('../middleware/upload');
const router = express.Router();

router.get(
  '/profile',
  asyncHandler(userController.getProfile)
);

router.put(
  '/profile',
  uploadUserImage,
  processUserImage,
  validate(userSchemas.updateProfile),
  asyncHandler(userController.updateProfile)
);

router.put(
  '/profile/image',
  uploadUserImage,
  processUserImage,
  asyncHandler(userController.updateProfileImage)
);

router.get(
  '/stats',
  asyncHandler(userController.getWorkoutStats)
);

// Admin-only routes
router.get(
  '/admin/all-users',
  authMiddleware,
  roleCheck(['admin']), // Only admins can list all users
  asyncHandler(userController.getAllUsers)
);

router.put(
  '/admin/change-role/:id',
  authMiddleware,
  roleCheck(['admin']), // Only admins can change roles
  validate(userSchemas.changeRole),
  asyncHandler(userController.changeUserRole)
);

module.exports = router;