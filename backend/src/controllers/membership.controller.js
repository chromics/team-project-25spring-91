const { membershipService } = require('../services/membership.service');

const membershipController = {
  getUserMemberships: async (req, res) => {
    const userId = req.user.id;
    const memberships = await membershipService.getUserMemberships(userId);
    
    res.status(200).json({
      status: 'success',
      results: memberships.length,
      data: memberships
    });
  },
  
  getMembershipById: async (req, res) => {
    const userId = req.user.id;
    const membershipId = parseInt(req.params.id);
    
    const membership = await membershipService.getMembershipById(userId, membershipId);
    
    res.status(200).json({
      status: 'success',
      data: membership
    });
  },
  
  createMembership: async (req, res) => {
    const userId = req.user.id;
    const membershipData = {
      ...req.body,
      userId
    };
    
    const result = await membershipService.createMembership(membershipData);
    
    res.status(201).json({
      status: 'success',
      message: 'Membership created successfully',
      data: result
    });
  },
  
  updateMembership: async (req, res) => {
    const userId = req.user.id;
    const membershipId = parseInt(req.params.id);
    const updateData = req.body;
    
    const updatedMembership = await membershipService.updateMembership(userId, membershipId, updateData);
    
    res.status(200).json({
      status: 'success',
      message: 'Membership updated successfully',
      data: updatedMembership
    });
  },
  
  cancelMembership: async (req, res) => {
    const userId = req.user.id;
    const membershipId = parseInt(req.params.id);
    
    await membershipService.cancelMembership(userId, membershipId);
    
    res.status(200).json({
      status: 'success',
      message: 'Membership cancelled successfully'
    });
  },
  
  getMembershipPayments: async (req, res) => {
    const userId = req.user.id;
    const membershipId = parseInt(req.params.id);
    
    const payments = await membershipService.getMembershipPayments(userId, membershipId);
    
    res.status(200).json({
      status: 'success',
      results: payments.length,
      data: payments
    });
  }
};

module.exports = { membershipController };