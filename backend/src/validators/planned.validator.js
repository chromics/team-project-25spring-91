/** 
     * AI-generated-content 
     * tool: ChatGPT4o-mini
     * usage: Validation is written by AI because depend on our api feature, AI can detect edge case scenarios better than human, so I let AI to validate 
     */ 
const { z } = require('zod');

const plannedSchemas = {
  getPlannedWorkout: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Workout ID must be a number'
      })
    })
  }),
  
  // getCalendar: z.object({
  //   query: z.object({
  //     startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
  //       message: 'Invalid start date format'
  //     }),
  //     endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
  //       message: 'Invalid end date format'
  //     })
  //   })
  // }),
  
  createPlannedWorkout: z.object({
    body: z.object({
      title: z.string().min(2, 'Workout title must be at least 2 characters'),
      scheduledDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid date format'
      }),
      estimatedDuration: z.number().int().min(1).optional(),
      exercises: z.array(
        z.object({
          exerciseId: z.number().int().positive(),
          plannedSets: z.number().int().positive().optional(),
          plannedReps: z.number().int().positive().optional(),
          plannedWeight: z.number().positive().optional(),
          plannedDuration: z.number().int().positive().optional(),
          plannedCalories: z.number().int().positive().optional()
        })
      ).min(1, 'At least one exercise is required')
    })
  }),
  
  updatePlannedWorkout: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Workout ID must be a number'
      })
    }),
    body: z.object({
      title: z.string().min(2).optional(),
      scheduledDate: z.string().refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'Invalid date format'
      }).optional(),
      estimatedDuration: z.number().int().min(1).optional(),
      exercises: z.array(
        z.object({
          id: z.number().int().positive().optional(), // If updating existing exercise
          exerciseId: z.number().int().positive(),
          plannedSets: z.number().int().positive().optional(),
          plannedReps: z.number().int().positive().optional(),
          plannedWeight: z.number().positive().optional(),
          plannedDuration: z.number().int().positive().optional(),
          plannedCalories: z.number().int().positive().optional()
        })
      ).optional()
    })
  }),
  
  deletePlannedWorkout: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Workout ID must be a number'
      })
    })
  })
};

module.exports = { plannedSchemas };