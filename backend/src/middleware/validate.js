// src/middleware/validate.js
const { z } = require('zod');
const { ApiError } = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  try {
    if (!schema || typeof schema.parse !== 'function') {
      console.error('Invalid schema provided to validate middleware');
      return next(new ApiError(500, 'Server configuration error'));
    }
    
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (error) {
    console.error('Validation error:', error);
    
    // Handle Zod errors
    if (error.errors) {
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      return next(new ApiError(400, 'Validation error', formattedErrors));
    }
    
    // Handle other errors
    next(new ApiError(400, 'Validation error', [{ message: error.message }]));
  }
};

module.exports = { validate };