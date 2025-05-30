// src/validators/competition.validator.js
const { z } = require('zod');

const competitionSchemas = {
  // Create a new competition
  createCompetition: z.object({
    body: z.object({
      gymId: z.number({
        required_error: 'Gym ID is required'
      }).int().positive('Gym ID must be a positive integer'),
      name: z.string({
        required_error: 'Name is required'
      }).min(1, 'Name cannot be empty'),
      description: z.string().optional(),
      startDate: z.string().datetime({
        message: 'Start date must be a valid ISO datetime string'
      }),
      endDate: z.string().datetime({
        message: 'End date must be a valid ISO datetime string'
      }),
      imageUrl: z.string().url().optional(),
      maxParticipants: z.number().int().positive().optional(),
      isActive: z.boolean().optional().default(true)
    }).refine(data => new Date(data.startDate) < new Date(data.endDate), {
      message: 'End date must be after start date',
      path: ['endDate']
    })
  }),

  // Update competition details
  updateCompetition: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Competition ID must be a number'
      })
    }),
    body: z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      imageUrl: z.string().url().optional(),
      maxParticipants: z.number().int().positive().optional(),
      isActive: z.boolean().optional()
    })
  }),

  // Get competition by ID
  getCompetition: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Competition ID must be a number'
      })
    })
  }),

  // Create task for a competition
  createTask: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Competition ID must be a number'
      })
    }),
    body: z.object({
      exerciseId: z.number().int().positive().optional(),
      name: z.string({
        required_error: 'Task name is required'
      }).min(1, 'Task name cannot be empty'),
      description: z.string().optional(),
      targetValue: z.number({
        required_error: 'Target value is required'
      }).positive('Target value must be positive'),
      unit: z.string({
        required_error: 'Unit is required'
      }).min(1, 'Unit cannot be empty'),
      pointsValue: z.number().int().positive().optional().default(100)
    })
  }),

  // Update task
  updateTask: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Task ID must be a number'
      })
    }),
    body: z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      targetValue: z.number().positive().optional(),
      unit: z.string().min(1).optional(),
      pointsValue: z.number().int().positive().optional()
    })
  }),

  // Join competition
  joinCompetition: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Competition ID must be a number'
      })
    })
  }),

  // Update progress
  updateProgress: z.object({
    params: z.object({
      taskId: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Task ID must be a number'
      })
    }),
    body: z.object({
      currentValue: z.number({
        required_error: 'Current value is required'
      }).nonnegative('Current value cannot be negative'),
      isCompleted: z.boolean().optional(),
      notes: z.string().optional()
    })
  }),

  // Get leaderboard
  getLeaderboard: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Competition ID must be a number'
      })
    }),
    query: z.object({
      limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
      page: z.string().optional().transform(val => val ? parseInt(val) : 1)
    })
  }),

  getCompetitionTasks: z.object({
    params: z.object({
      competitionId: z.string().refine((val) => !isNaN(parseInt(val)), {
        message: 'Competition ID must be a number',
      }),
    }),
  }),

  listSubscribedGymCompetitions: z.object({
    query: z.object({
      isActive: z.string().optional().transform(val => val === 'true' ? true : (val === 'false' ? false : undefined)),
      search: z.string().optional(),
      page: z.string().optional().transform(val => (val ? parseInt(val) : 1)),
      limit: z.string().optional().transform(val => (val ? parseInt(val) : 10)),
      includeEnded: z.string().optional().transform(val => val === 'true'),
    }),
  })
};

module.exports = { competitionSchemas };