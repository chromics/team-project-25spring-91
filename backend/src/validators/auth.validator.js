// src/validators/auth.validator.js
/** 
     * AI-generated-content 
     * tool: ChatGPT4o-mini
     * usage: Validation is written by AI because depend on our api feature, AI can detect edge case scenarios better than human, so I let AI to validate 
     */ 
const { z } = require('zod');

const authSchemas = {
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      displayName: z.string().min(2, 'Display name must be at least 2 characters'),
      dateOfBirth: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'Invalid date format'
      }),
      gender: z.string().optional(),
      heightCm: z.number().int().positive().optional(),
      weightKg: z.number().positive().optional()
    })
  }),
  
  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required')
    })
  })
};

module.exports = { authSchemas };