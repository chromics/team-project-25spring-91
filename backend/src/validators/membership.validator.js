// src/validators/membership.validator.js
const { z } = require('zod');

const membershipSchemas = {
  getMembership: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Membership ID must be a number'
      })
    })
  }),
  
  createMembership: z.object({
    body: z.object({
      gymId: z.number().int().positive('Gym ID is required'),
      planId: z.number().int().positive('Membership plan ID is required'),
      autoRenew: z.boolean().optional().default(false),
      paymentMethod: z.string({
        required_error: 'Payment method is required'
      })
    })
  }),
  
  updateMembership: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Membership ID must be a number'
      })
    }),
    body: z.object({
      autoRenew: z.boolean().optional()
    })
  }),
  
  cancelMembership: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Membership ID must be a number'
      })
    })
  })
};

module.exports = { membershipSchemas };