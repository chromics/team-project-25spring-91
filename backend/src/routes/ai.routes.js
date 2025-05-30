const express = require('express');
const { validate } = require('../middleware/validate');
const { aiController } = require('../controllers/ai.controller');
const { aiSchemas } = require('../validators/ai.validator');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.post(
  '/chat',
  validate(aiSchemas.generateChat), 
  asyncHandler(aiController.generateChatResponse),
);

router.post(
  '/interactions',
  validate(aiSchemas.createInteraction),
  asyncHandler(aiController.createInteraction),
);

router.get(
  '/interactions',
  validate(aiSchemas.listInteractions),
  asyncHandler(aiController.getUserInteractions),
);

router.get(
  '/interactions/:id',
  validate(aiSchemas.getInteraction),
  asyncHandler(aiController.getInteractionById),
);

router.delete(
  '/interactions/:id',
  validate(aiSchemas.getInteraction),
  asyncHandler(aiController.deleteInteraction),
);

module.exports = router;
