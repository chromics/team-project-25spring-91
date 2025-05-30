const { z } = require('zod');

const aiSchemas = {
  generateChat: z.object({
    body: z.object({
      prompt: z
        .string({ required_error: 'Prompt is required' })
        .min(1, 'Prompt cannot be empty')
        .max(5000, 'Prompt is too long (max 5000 characters)'),
    }),
  }),

  createInteraction: z.object({
    body: z.object({
      prompt: z.string().min(1).max(5000),
      response: z.string().min(1).max(10000),
      interactionType: z.string().max(50).optional().nullable(),
    }),
  }),

  getInteraction: z.object({
    params: z.object({
      id: z.string().refine((val) => !isNaN(parseInt(val)), { message: 'Interaction ID must be a number' }),
    }),
  }),

  listInteractions: z.object({
    query: z.object({
      page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
      limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
      interactionType: z.string().optional(),
    }),
  }),
};

module.exports = { aiSchemas };
