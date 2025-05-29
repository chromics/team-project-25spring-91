// src/controllers/membershipPlan.controller.js
const { membershipPlanService } = require('../services/membershipPlan.service');
const { ApiError } = require('../utils/ApiError');

const membershipPlanController = {
  createMembershipPlan: async (req, res) => {
    const gymId = parseInt(req.params.gymId);
    const { id: userId, role: userRole } = req.user;

    const newPlan = await membershipPlanService.createMembershipPlan({
      gymId,
      userId,
      userRole,
      data: req.body,
    });

    res.status(201).json({
      status: 'success',
      message: 'Membership plan created successfully',
      data: newPlan,
    });
  },

  getMembershipPlanById: async (req, res) => {
    const planId = parseInt(req.params.planId);
    const plan = await membershipPlanService.getMembershipPlanById(planId);
    res.status(200).json({
      status: 'success',
      data: plan,
    });
  },

  // This controller method can be used by the existing gym route
  getMembershipPlansByGym: async (req, res) => {
    const gymId = parseInt(req.params.id); // Assuming gymId comes from gym.routes.js
    const plans = await membershipPlanService.getMembershipPlansByGymId(gymId);
    res.status(200).json({
      status: 'success',
      results: plans.length,
      data: plans,
    });
  },

  updateMembershipPlan: async (req, res) => {
    const planId = parseInt(req.params.planId);
    const { id: userId, role: userRole } = req.user;

    const updatedPlan = await membershipPlanService.updateMembershipPlan({
      planId,
      userId,
      userRole,
      data: req.body,
    });

    res.status(200).json({
      status: 'success',
      message: 'Membership plan updated successfully',
      data: updatedPlan,
    });
  },

  deleteMembershipPlan: async (req, res) => {
    const planId = parseInt(req.params.planId);
    const { id: userId, role: userRole } = req.user;

    const result = await membershipPlanService.deleteMembershipPlan({
      planId,
      userId,
      userRole,
    });

    if (result === null) {
      // Hard delete occurred
      res.status(200).json({
        status: 'success',
        message: 'Membership plan deleted successfully',
      });
    } else {
      // Deactivation occurred
      res.status(200).json({
        status: 'success',
        message:
          'Membership plan deactivated as it has active user subscriptions.',
        data: result,
      });
    }
  },
};

module.exports = { membershipPlanController };
