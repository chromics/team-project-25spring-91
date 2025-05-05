const { z } = require('zod');

const gymSchemas = {
  getGym: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Gym ID must be a number'
      })
    })
  }),
  
  // Only admin would be able to create/update gyms, so we're not including those schemas here
};

module.exports = { gymSchemas };