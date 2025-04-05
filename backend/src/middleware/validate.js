const { z } = require('zod');
const { ApiError } = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (error) {
    const errors = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message
    }));
    
    next(new ApiError(400, 'Validation error', errors));
  }
};

module.exports = { validate };