const express = require('express');
const { validate } = require('../middleware/validate');
const { authController } = require('../controllers/auth.controller');
const { authSchemas } = require('../controllers/auth.validator');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.post(
  '/register',
  validate(authSchemas.register),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  validate(authSchemas.login),
  asyncHandler(authController.login)
);

module.exports = router;