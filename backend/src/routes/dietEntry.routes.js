// src/routes/dietEntry.routes.js
const express = require('express');
const { dietEntryController } = require('../controllers/dietEntry.controller');
const { validate } = require('../middleware/validate');
const { dietSchemas } = require('../validators/diet.validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user's diet entries and summary
router.get(
  '/',
  validate(dietSchemas.getUserDietEntries),
  asyncHandler(dietEntryController.getUserDietEntries)
);

router.get(
  '/summary',
  validate(dietSchemas.getUserDietSummary),
  asyncHandler(dietEntryController.getUserDietSummary)
);

// Get specific diet entry
router.get(
  '/:id',
  validate(dietSchemas.getDietEntry),
  asyncHandler(dietEntryController.getDietEntryById)
);

// Create diet entry
router.post(
  '/',
  validate(dietSchemas.createDietEntry),
  asyncHandler(dietEntryController.createDietEntry)
);

// Update diet entry
router.put(
  '/:id',
  validate(dietSchemas.updateDietEntry),
  asyncHandler(dietEntryController.updateDietEntry)
);

// Delete diet entry
router.delete(
  '/:id',
  validate(dietSchemas.getDietEntry),
  asyncHandler(dietEntryController.deleteDietEntry)
);

module.exports = router;