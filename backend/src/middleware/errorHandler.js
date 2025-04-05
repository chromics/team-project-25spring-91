const { Prisma } = require('@prisma/client');
const { ApiError } = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Prisma specific errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        message: 'A resource with this data already exists',
        error: err.meta?.target || 'Unique constraint violation'
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found',
        error: err.meta?.cause || 'Record not found'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: 'Database error',
      error: err.message
    });
  }

  // Handle our custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      error: err.error || undefined
    });
  }

  // Default error handling
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  return res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 ? 'Internal Server Error' : message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = { errorHandler };