// controller/auth.controller.js
const { authService } = require('../services/auth.service');
const { ApiError } = require('../utils/ApiError');

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
  }
};

module.exports = { authController };