const { ApiError } = require('../utils/ApiError');

/**
 * Middleware to check if the user has one of the required roles
 * @param {string[]} allowedRoles - Array of roles that are allowed to access the route
 */
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const userRole = req.user.role || 'user';
    
    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      next(new ApiError(403, 'You do not have permission to perform this action'));
    }
  };
};

module.exports = { roleCheck };