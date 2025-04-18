/** 
     * AI-generated-content 
     * tool: ChatGPT4o-mini
     * usage: Validation is written by AI because depend on our api feature, AI can detect edge case scenarios better than human, so I let AI to validate 
     */ 
const { z } = require('zod');

const exerciseSchemas = {
  getExercise: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Exercise ID must be a number'
      })
    })
  }),
  
  createExercise: z.object({
    body: z.object({
      name: z.string().min(2, 'Exercise name must be at least 2 characters'),
      category: z.string().optional(),
      description: z.string().optional()
    })
  }),
  
  updateExercise: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Exercise ID must be a number'
      })
    }),
    body: z.object({
      name: z.string().min(2).optional(),
      category: z.string().optional(),
      description: z.string().optional()
    })
  }),
  
  deleteExercise: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Exercise ID must be a number'
      })
    })
  })
};

module.exports = { exerciseSchemas };