// src/routes/membershipPlan.routes.js
const express = require('express');
const { validate } = require('../middleware/validate');
const {
  membershipPlanController,
} = require('../controllers/membershipPlan.controller');
const {
  membershipPlanSchemas,
} = require('../validators/membershipPlan.validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { authMiddleware } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
// Note: ownershipCheck for plans will be handled within the service/controller
// by checking gym ownership, as plan creation is tied to a gym.

const router = express.Router();

// --- Public route to get a specific plan's details ---
router.get(
  '/plans/:planId', // Changed to a more distinct path
  validate(membershipPlanSchemas.getMembershipPlan),
  asyncHandler(membershipPlanController.getMembershipPlanById),
);

// --- All routes below require authentication ---
router.use(authMiddleware);

// --- Create a new membership plan for a specific gym ---
// This route is nested under gyms for contextual creation
// POST /api/gyms/:gymId/membership-plans
// This will be added to gym.routes.js

// --- Update a specific membership plan ---
router.put(
  '/plans/:planId', // Changed to a more distinct path
  roleCheck(['admin', 'gym_owner']),
  validate(membershipPlanSchemas.updateMembershipPlan),
  asyncHandler(membershipPlanController.updateMembershipPlan),
);

// --- Delete/Deactivate a specific membership plan ---
router.delete(
  '/plans/:planId', // Changed to a more distinct path
  roleCheck(['admin', 'gym_owner']),
  validate(membershipPlanSchemas.getMembershipPlan), // Validate planId exists
  asyncHandler(membershipPlanController.deleteMembershipPlan),
);

module.exports = router;
