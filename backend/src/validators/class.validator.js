const { z } = require('zod');

const classSchemas = {
  getClass: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Class ID must be a number'
      })
    })
  })
};

module.exports = { classSchemas };