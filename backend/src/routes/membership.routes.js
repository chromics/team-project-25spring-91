// src/routes/membership.routes.js
const express = require('express');
const { validate } = require('../middleware/validate');
const { membershipController } = require('../controllers/membership.controller');
const { membershipSchemas } = require('../validators/membership.validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get(
  '/my-memberships',
  asyncHandler(membershipController.getUserMemberships)
);

router.get(
  '/:id',
  validate(membershipSchemas.getMembership),
  asyncHandler(membershipController.getMembershipById)
);

router.post(
  '/subscribe',
  validate(membershipSchemas.createMembership),
  asyncHandler(membershipController.createMembership)
);

router.put(
  '/:id',
  validate(membershipSchemas.updateMembership),
  asyncHandler(membershipController.updateMembership)
);

router.post(
  '/:id/cancel',
  validate(membershipSchemas.cancelMembership),
  asyncHandler(membershipController.cancelMembership)
);

router.get(
  '/:id/payments',
  validate(membershipSchemas.getMembership),
  asyncHandler(membershipController.getMembershipPayments)
);

module.exports = router;