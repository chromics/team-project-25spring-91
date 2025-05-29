// src/validators/membershipPlan.validator.js
const { z } = require('zod');

const membershipPlanSchemas = {
  createMembershipPlan: z.object({
    params: z.object({
      gymId: z.string().refine((val) => !isNaN(parseInt(val)), {
        message: 'Gym ID must be a number',
      }),
    }),
    body: z.object({
      name: z
        .string({ required_error: 'Plan name is required' })
        .min(3, 'Plan name must be at least 3 characters')
        .max(100, 'Plan name cannot exceed 100 characters'),
      description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
      durationDays: z
        .number({
          required_error: 'Duration in days is required',
        })
        .int()
        .positive('Duration must be a positive number of days'),
      price: z
        .number({ required_error: 'Price is required' })
        .positive('Price must be a positive number')
        .max(99999.99, 'Price seems too high'), // Max 99,999.99
      maxBookingsPerWeek: z.number().int().positive().optional().nullable(),
      isActive: z.boolean().optional().default(true),
    }),
  }),

  getMembershipPlan: z.object({
    params: z.object({
      planId: z.string().refine((val) => !isNaN(parseInt(val)), {
        message: 'Plan ID must be a number',
      }),
    }),
  }),

  updateMembershipPlan: z.object({
    params: z.object({
      planId: z.string().refine((val) => !isNaN(parseInt(val)), {
        message: 'Plan ID must be a number',
      }),
    }),
    body: z
      .object({
        name: z
          .string()
          .min(3, 'Plan name must be at least 3 characters')
          .max(100, 'Plan name cannot exceed 100 characters')
          .optional(),
        description: z.string().max(500, 'Description cannot exceed 500 characters').optional().nullable(),
        durationDays: z.number().int().positive('Duration must be a positive number of days').optional(),
        price: z.number().positive('Price must be a positive number').max(99999.99).optional(),
        maxBookingsPerWeek: z.number().int().positive().optional().nullable(),
        isActive: z.boolean().optional(),
      })
      .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
      }),
  }),
};

module.exports = { membershipPlanSchemas };
