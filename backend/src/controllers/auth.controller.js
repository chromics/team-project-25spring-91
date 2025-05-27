//src/controllers/auth.controller.js
const { authService } = require('../services/auth.service');
const { ApiError } = require('../utils/ApiError');
const jwt = require('jsonwebtoken');

const authController = {
  register: async (req, res) => {
    const userData = req.body;
    const result = await authService.registerUser(userData);
    
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: result
    });
  },
  
  login: async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    
    if (!result) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: result
    });
  },
  
  // Improved OAuth callback handler
  oauthCallback: async (req, res) => {
    // User will be attached to req by passport
    if (!req.user) {
      // Return JSON error for API clients
      if (req.get('Accept') === 'application/json') {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication failed'
        });
      }
      // Redirect browser clients to login page with error
      return res.redirect('/api/auth/login-failed');
    }
    
    // Get provider name for the message
    const provider = req.user.oauthProvider 
      ? req.user.oauthProvider.charAt(0).toUpperCase() + req.user.oauthProvider.slice(1)
      : 'OAuth';
    
    // Generate JWT for the authenticated user
    const token = jwt.sign(
      { userId: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Prepare user data
    const userData = {
      id: req.user.id,
      email: req.user.email,
      displayName: req.user.displayName
    };
    
    // For API testing with Postman or other API clients
    if (req.get('Accept') === 'application/json') {
      return res.json({
        status: 'success',
        message: `${provider} login successful`,
        data: {
          user: userData,
          token
        }
      });
    }
    
    // For browser flow, check if frontend URL is configured
    if (process.env.FRONTEND_URL) {
      // Redirect to frontend with token
      return res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
    }
    
    // Fallback when no frontend is configured yet (your current situation)
    return res.json({
      status: 'success',
      message: `${provider} login successful`,
      data: {
        user: userData,
        token
      }
    });
  }
};

module.exports = { authController };
