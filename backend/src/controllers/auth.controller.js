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
  
  // Add this new method for OAuth callbacks
  oauthCallback: async (req, res) => {
    // User will be attached to req by passport
    if (!req.user) {
      return res.redirect('/login?error=authentication_failed');
    }
    
    // Generate JWT for the authenticated user
    const token = jwt.sign(
      { userId: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // For API testing with Postman, return JSON
    if (req.get('Accept') === 'application/json') {
      return res.json({
        status: 'success',
        message: 'OAuth login successful',
        data: {
          user: {
            id: req.user.id,
            email: req.user.email,
            displayName: req.user.displayName
          },
          token
        }
      });
    }
    
    // For browser flow, redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
  }
};

module.exports = { authController };