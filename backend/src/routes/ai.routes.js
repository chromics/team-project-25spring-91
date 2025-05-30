// src/routes/ai.routes.js
const express = require('express');
const { validate } = require('../middleware/validate');
const { aiController } = require('../controllers/ai.controller');
const { aiSchemas } = require('../validators/ai.validator');
const { asyncHandler } = require('../utils/asyncHandler');
// authMiddleware will be applied at the app level for /api/ai

const router = express.Router();

// Create a new AI interaction log
router.post(
  '/interactions',
  validate(aiSchemas.createInteraction),
  asyncHandler(aiController.createInteraction),
);

// Get all AI interactions for the logged-in user (paginated)
router.get(
  '/interactions',
  validate(aiSchemas.listInteractions),
  asyncHandler(aiController.getUserInteractions),
);

// Get a specific AI interaction by ID
router.get(
  '/interactions/:id',
  validate(aiSchemas.getInteraction),
  asyncHandler(aiController.getInteractionById),
);

// Delete a specific AI interaction by ID
router.delete(
  '/interactions/:id',
  validate(aiSchemas.getInteraction),
  asyncHandler(aiController.deleteInteraction),
);

module.exports = router;
