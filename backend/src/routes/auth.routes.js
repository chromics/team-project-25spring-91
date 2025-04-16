const express = require('express');
const passport = require('passport');
const { validate } = require('../middleware/validate');
const { authController } = require('../controllers/auth.controller');
const { authSchemas } = require('../controllers/auth.validator');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

// Standard email/password routes
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

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/login-failed',
    session: false
  }),
  asyncHandler(authController.oauthCallback)
);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', { 
    failureRedirect: '/api/auth/login-failed',
    session: false
  }),
  asyncHandler(authController.oauthCallback)
);

// Add a failure route for testing
router.get('/login-failed', (req, res) => {
  res.status(401).json({
    status: 'error',
    message: 'OAuth authentication failed'
  });
});

module.exports = router;