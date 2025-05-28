// src/utils/ApiError.js
class ApiError extends Error {
    constructor(statusCode, message, error = null) {
      super(message);
      this.statusCode = statusCode;
      this.error = error;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = { ApiError };