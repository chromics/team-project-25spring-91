const express = require('express');
const passport = require('passport');
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

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  authController.oauthCallback
);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  authController.oauthCallback
);

module.exports = router;