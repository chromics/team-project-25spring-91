/** 
     * AI-generated-content 
     * tool: ChatGPT4o-mini
     * usage: Validation is written by AI because depend on our api feature, AI can detect edge case scenarios better than human, so I let AI to validate 
     */ 
const { z } = require('zod');

const statisticsSchemas = {
  getExerciseProgress: z.object({
    params: z.object({
      exerciseId: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Exercise ID must be a number'
      })
    })
  })
};

module.exports = { statisticsSchemas };