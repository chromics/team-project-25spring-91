/** 
     * AI-generated-content 
     * tool: ChatGPT4o-mini
     * usage: Validation is written by AI because depend on our api feature, AI can detect edge case scenarios better than human, so I let AI to validate 
     */ 
const { z } = require('zod');

const userSchemas = {
  updateProfile: z.object({
    body: z.object({
      displayName: z.string().min(2).optional(),
      dateOfBirth: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'Invalid date format'
      }),
      gender: z.string().optional(),
      heightCm: z.number().int().positive().optional(),
      weightKg: z.number().positive().optional(),
      currentPassword: z.string().optional(),
      newPassword: z.string().min(8).optional()
    }).refine(data => {
      // If newPassword is provided, currentPassword must also be provided
      return !(data.newPassword && !data.currentPassword);
    }, {
      message: "Current password is required when setting a new password",
      path: ["currentPassword"]
    })
  })
};

module.exports = { userSchemas };