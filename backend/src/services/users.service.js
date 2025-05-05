const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const userService = {
  getUserProfile: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        dateOfBirth: true,
        gender: true,
        heightCm: true,
        weightKg: true,
        createdAt: true,
        role: true,
        imageUrl: true
      }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    return user;
  },
  
  updateUserProfile: async (userId, updateData) => {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Handle password update
    let passwordUpdate = {};
    if (updateData.newPassword && updateData.currentPassword) {
      const isPasswordValid = await bcrypt.compare(
        updateData.currentPassword, 
        user.passwordHash
      );
      
      if (!isPasswordValid) {
        throw new ApiError(400, 'Current password is incorrect');
      }
      
      passwordUpdate = {
        passwordHash: await bcrypt.hash(updateData.newPassword, 10)
      };
    }
    
    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: updateData.displayName,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
        gender: updateData.gender,
        heightCm: updateData.heightCm,
        weightKg: updateData.weightKg,
        imageUrl: updateData.imageUrl,
        ...passwordUpdate
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        dateOfBirth: true,
        gender: true,
        heightCm: true,
        weightKg: true,
        createdAt: true,
        role: true,
        imageUrl: true
      }
    });
    
    return updatedUser;
  },
  
  // Admin-only function to change a user's role
  changeUserRole: async (adminId, targetUserId, newRole) => {
    // Verify the requester is an admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true }
    });
    
    if (admin?.role !== 'admin') {
      throw new ApiError(403, 'Only administrators can change user roles');
    }
    
    // Validate the role is one of the allowed roles
    const allowedRoles = ['admin', 'gym_owner', 'user'];
    if (!allowedRoles.includes(newRole)) {
      throw new ApiError(400, `Role must be one of: ${allowedRoles.join(', ')}`);
    }
    
    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });
    
    if (!targetUser) {
      throw new ApiError(404, 'Target user not found');
    }
    
    // Update the role
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true
      }
    });
    
    return updatedUser;
  },

  // Admin-only function to list all users with pagination
  getAllUsers: async (page = 1, limit = 20, filter = {}) => {
    const skip = (page - 1) * limit;
    
    // Build where clause based on filters
    const where = {};
    
    if (filter.role) {
      where.role = filter.role;
    }
    
    if (filter.search) {
      where.OR = [
        { email: { contains: filter.search, mode: 'insensitive' } },
        { displayName: { contains: filter.search, mode: 'insensitive' } }
      ];
    }
    
    // Get total count
    const totalCount = await prisma.user.count({ where });
    
    // Get paginated users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
        imageUrl: true,
        _count: {
          select: {
            plannedWorkouts: true,
            actualWorkouts: true,
            userMemberships: true,
            userBookings: true,
            ownedGyms: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });
    
    return {
      users,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        page,
        limit
      }
    };
  }
  
  // getUserWorkoutStats: async (userId) => {
  //   // Get total planned workouts
  //   const totalPlanned = await prisma.plannedWorkout.count({
  //     where: { userId }
  //   });
    
  //   // Get total completed workouts
  //   const totalCompleted = await prisma.actualWorkout.count({
  //     where: { userId }
  //   });
    
  //   // Get completion rate
  //   const completionRate = totalPlanned > 0 
  //     ? ((await prisma.actualWorkout.count({
  //         where: {
  //           userId,
  //           plannedId: { not: null }
  //         }
  //       }) / totalPlanned) * 100).toFixed(2)
  //     : 0;
    
  //   // Get weekly workout frequency (last 4 weeks)
  //   const fourWeeksAgo = new Date();
  //   fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
  //   const recentWorkouts = await prisma.actualWorkout.findMany({
  //     where: {
  //       userId,
  //       completedDate: { gte: fourWeeksAgo }
  //     },
  //     select: {
  //       completedDate: true
  //     },
  //     orderBy: {
  //       completedDate: 'asc'
  //     }
  //   });
    
  //   // Group by week
  //   const weeklyFrequency = {};
  //   recentWorkouts.forEach(workout => {
  //     const weekStart = new Date(workout.completedDate);
  //     weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  //     const weekKey = weekStart.toISOString().split('T')[0];
      
  //     if (!weeklyFrequency[weekKey]) {
  //       weeklyFrequency[weekKey] = 0;
  //     }
      
  //     weeklyFrequency[weekKey]++;
  //   });
    
  //   return {
  //     totalPlanned,
  //     totalCompleted,
  //     completionRate: parseFloat(completionRate),
  //     weeklyFrequency: Object.entries(weeklyFrequency).map(([week, count]) => ({
  //       week,
  //       count
  //     })),
  //     // Add streak calculation
  //     currentStreak: calculateStreak(recentWorkouts.map(w => w.completedDate))
  //   };
  // }
};

// Helper function to calculate streak
// function calculateStreak(dates) {
//   if (dates.length === 0) return 0;
  
//   // Sort dates in descending order
//   const sortedDates = [...dates].sort((a, b) => new Date(b) - new Date(a));
  
//   // Check if the most recent workout was within the last 48 hours
//   const mostRecent = new Date(sortedDates[0]);
//   const now = new Date();
//   const daysSinceLastWorkout = Math.floor((now - mostRecent) / (1000 * 60 * 60 * 24));
  
//   if (daysSinceLastWorkout > 2) return 0;  // Streak broken if more than 2 days
  
//   // Calculate continuous streak
//   let streak = 1;
//   let currentDate = new Date(sortedDates[0]);
  
//   // For each previous date, check if it falls within streak window
//   for (let i = 1; i < sortedDates.length; i++) {
//     const prevDate = new Date(sortedDates[i]);
//     const dayDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
    
//     if (dayDiff <= 2) {  // Allow a 1-day gap
//       if (dayDiff >= 1) {  // Only count as new day if at least 1 day apart
//         streak++;
//         currentDate = prevDate;
//       }
//     } else {
//       break;  // Streak broken
//     }
//   }
  
//   return streak;
// }

module.exports = { userService };