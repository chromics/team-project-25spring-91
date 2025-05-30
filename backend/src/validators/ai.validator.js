// src/validators/ai.validator.js
const { z } = require('zod');

const aiSchemas = {
  createInteraction: z.object({
    body: z.object({
      prompt: z
        .string({ required_error: 'Prompt is required' })
        .min(1, 'Prompt cannot be empty')
        .max(5000, 'Prompt is too long (max 5000 characters)'), // Adjust max length as needed
      response: z
        .string({ required_error: 'Response is required' })
        .min(1, 'Response cannot be empty')
        .max(10000, 'Response is too long (max 10000 characters)'), // Adjust max length
      interactionType: z.string().max(50, 'Interaction type is too long').optional().nullable(),
      // contextualData: z.record(z.any()).optional().nullable(), // If you decide to use contextualData
    }),
  }),

  getInteraction: z.object({
    params: z.object({
      id: z.string().refine((val) => !isNaN(parseInt(val)), {
        message: 'Interaction ID must be a number',
      }),
    }),
  }),

  listInteractions: z.object({
    query: z.object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
      interactionType: z.string().optional(),
    }),
  }),
};

module.exports = { aiSchemas };
