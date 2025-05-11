//src/middleware/ownershipCheck.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

/**
 * Middleware to check if the user owns the resource or is an admin
 * @param {string} resourceType - Type of resource to check ('gym', 'gymClass', etc.)
 */
const ownershipCheck = (resourceType) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const userId = req.user.id;
    const resourceId = parseInt(req.params.id);
    
    // Admins can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    try {
      let hasAccess = false;

      switch (resourceType) {
        case 'gym':
          // Check if user owns the gym
          const gym = await prisma.gym.findUnique({
            where: { id: resourceId }
          });
          hasAccess = gym && gym.ownerId === userId;
          break;
          
        case 'gymClass':
          // Check if user owns the gym that contains this class
          const gymClass = await prisma.gymClass.findUnique({
            where: { id: resourceId },
            include: { gym: true }
          });
          hasAccess = gymClass && gymClass.gym.ownerId === userId;
          break;
          
        case 'membershipPlan':
          // Check if user owns the gym that offers this membership plan
          const plan = await prisma.membershipPlan.findUnique({
            where: { id: resourceId },
            include: { gym: true }
          });
          hasAccess = plan && plan.gym.ownerId === userId;
          break;
          
        case 'classSchedule':
          // Check if user owns the gym that offers this class schedule
          const schedule = await prisma.classSchedule.findUnique({
            where: { id: resourceId },
            include: { 
              gymClass: {
                include: { gym: true }
              }
            }
          });
          hasAccess = schedule && schedule.gymClass.gym.ownerId === userId;
          break;
          
        default:
          // Unknown resource type
          return next(new ApiError(500, 'Invalid resource type for ownership check'));
      }

      if (hasAccess) {
        next();
      } else {
        next(new ApiError(403, 'You do not have permission to manage this resource'));
      }
    } catch (error) {
      next(new ApiError(500, 'Error checking resource ownership', error.message));
    }
  };
};

module.exports = { ownershipCheck };