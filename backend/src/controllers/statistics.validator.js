//validator is written by AI
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