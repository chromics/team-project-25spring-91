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

// --- Public routes ---
router.get('/', asyncHandler(gymController.getAllGyms)); // Paginated list for everyone

router.get(
  '/:id',
  validate(gymSchemas.getGym),
  asyncHandler(gymController.getGymById),
);

// --- Protected routes ---
router.use(authMiddleware); // All routes below require authentication

// New route for admins to get ALL gyms (no pagination)
router.get(
  '/all/user-view', // Changed path to be more descriptive
  roleCheck(['admin', 'gym_owner', 'user']),
  asyncHandler(gymController.getAllGymsAdmin),
);

// New route for gym owners to get THEIR gyms (paginated)
router.get(
  '/owned/my-gyms', // Changed path to be more descriptive
  roleCheck(['gym_owner', 'admin']), // Admin can also see this for a specific owner if ownerId is a param, or their own if they are also an owner
  asyncHandler(gymController.getMyGyms), // Controller will use req.user.id
);

router.get(
  '/:id/classes',
  validate(gymSchemas.getGym),
  asyncHandler(gymController.getGymClasses),
);

router.get(
  '/:id/membership-plans',
  validate(gymSchemas.getGym),
  asyncHandler(gymController.getGymMembershipPlans),
);

// --- Admin and gym owner only routes for CREATION ---
router.post(
  '/',
  roleCheck(['admin', 'gym_owner']), // Both admin and gym_owner can create gyms
  uploadGymImage,
  processGymImage,
  validate(gymSchemas.createGym),
  asyncHandler(gymController.createGym),
);

// --- Admin or RESOURCE OWNER only routes for MODIFICATION ---
router.put(
  '/:id',
  ownershipCheck('gym'), // Checks if user is admin or owns the gym
  uploadGymImage,
  processGymImage,
  validate(gymSchemas.updateGym),
  asyncHandler(gymController.updateGym),
);

// --- Admin only for DELETION ---
// ownershipCheck could also be used here if gym_owners should delete their own gyms
// but current setup is admin only for deletion.
router.delete(
  '/:id',
  roleCheck(['admin']), // Or use ownershipCheck('gym') if owners can delete
  validate(gymSchemas.deleteGym),
  asyncHandler(gymController.deleteGym),
);

module.exports = router;
