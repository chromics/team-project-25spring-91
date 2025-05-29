// src/services/membershipPlan.service.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const membershipPlanService = {
  createMembershipPlan: async ({ gymId, userId, userRole, data }) => {
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
    });

    if (!gym) {
      throw new ApiError(404, 'Gym not found');
    }

    // Ownership check: if user is gym_owner, they must own this gym
    if (userRole === 'gym_owner' && gym.ownerId !== userId) {
      throw new ApiError(
        403,
        'You do not have permission to create plans for this gym.',
      );
    }

    // Check if a plan with the same name already exists for this gym
    const existingPlan = await prisma.membershipPlan.findFirst({
        where: {
            gymId: gymId,
            name: data.name,
        }
    });

    if (existingPlan) {
        throw new ApiError(409, `A membership plan named "${data.name}" already exists for this gym.`);
    }


    const newPlan = await prisma.membershipPlan.create({
      data: {
        gymId,
        name: data.name,
        description: data.description,
        durationDays: data.durationDays,
        price: data.price,
        maxBookingsPerWeek: data.maxBookingsPerWeek,
        isActive: data.isActive,
      },
      include: {
        gym: {
          select: { id: true, name: true },
        },
      },
    });
    return newPlan;
  },

  getMembershipPlanById: async (planId) => {
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
      include: {
        gym: { select: { id: true, name: true, ownerId: true } },
      },
    });
    if (!plan) {
      throw new ApiError(404, 'Membership plan not found');
    }
    return plan;
  },

  // For listing plans under a specific gym (used by gym.routes.js)
  getMembershipPlansByGymId: async (gymId) => {
     const gym = await prisma.gym.findUnique({ where: { id: gymId } });
     if (!gym) {
       throw new ApiError(404, 'Gym not found');
     }
    return prisma.membershipPlan.findMany({
      where: { gymId, isActive: true }, // Typically list active plans
      orderBy: { price: 'asc' },
    });
  },

  updateMembershipPlan: async ({ planId, userId, userRole, data }) => {
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
      include: { gym: true },
    });

    if (!plan) {
      throw new ApiError(404, 'Membership plan not found');
    }

    if (userRole === 'gym_owner' && plan.gym.ownerId !== userId) {
      throw new ApiError(
        403,
        'You do not have permission to update this membership plan.',
      );
    }

    // If name is being changed, check for uniqueness within the same gym
    if (data.name && data.name !== plan.name) {
        const existingPlanWithName = await prisma.membershipPlan.findFirst({
            where: {
                gymId: plan.gymId,
                name: data.name,
                id: { not: planId } // Exclude the current plan
            }
        });
        if (existingPlanWithName) {
            throw new ApiError(409, `Another membership plan named "${data.name}" already exists for this gym.`);
        }
    }


    const updatedPlan = await prisma.membershipPlan.update({
      where: { id: planId },
      data,
      include: {
        gym: { select: { id: true, name: true } },
      },
    });
    return updatedPlan;
  },

  deleteMembershipPlan: async ({ planId, userId, userRole }) => {
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
      include: {
        gym: true,
        _count: {
          select: { userMemberships: { where: { status: 'active' } } },
        },
      },
    });

    if (!plan) {
      throw new ApiError(404, 'Membership plan not found');
    }

    if (userRole === 'gym_owner' && plan.gym.ownerId !== userId) {
      throw new ApiError(
        403,
        'You do not have permission to delete this membership plan.',
      );
    }

    // If plan has active user memberships, deactivate it instead of deleting
    if (plan._count.userMemberships > 0) {
      return prisma.membershipPlan.update({
        where: { id: planId },
        data: { isActive: false },
        include: { gym: { select: { id: true, name: true } } },
      });
    }

    // Otherwise, delete it
    await prisma.membershipPlan.delete({
      where: { id: planId },
    });
    return null; // Indicates successful deletion
  },
};

module.exports = { membershipPlanService };
