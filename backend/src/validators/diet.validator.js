const { z } = require('zod');

const dietSchemas = {
  // Food Item Schemas
  createFoodItem: z.object({
    body: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
      description: z.string().optional(),
      caloriesPerUnit: z.number({
        required_error: 'Calories per unit is required'
      }).positive('Calories must be positive'),
      servingUnit: z.string({
        required_error: 'Serving unit is required'
      }).min(1, 'Serving unit cannot be empty').max(20, 'Serving unit cannot exceed 20 characters'),
      imageUrl: z.string().url('Invalid URL format').optional()
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional()
  }),
  
  updateFoodItem: z.object({
    body: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters').optional(),
      description: z.string().optional(),
      caloriesPerUnit: z.number().positive('Calories must be positive').optional(),
      servingUnit: z.string().min(1, 'Serving unit cannot be empty').max(20, 'Serving unit cannot exceed 20 characters').optional(),
      imageUrl: z.string().url('Invalid URL format').optional().nullable()
    }),
    query: z.object({}).optional(),
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Food item ID must be a number'
      })
    })
  }),
  
  getFoodItem: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Food item ID must be a number'
      })
    }),
    query: z.object({}).optional(),
    body: z.object({}).optional()
  }),
  
  searchFoodItems: z.object({
    query: z.object({
      search: z.string().optional(),
      page: z.string().optional().transform(val => val ? parseInt(val) : 1),
      limit: z.string().optional().transform(val => val ? parseInt(val) : 20)
    }),
    body: z.object({}).optional(),
    params: z.object({}).optional()
  }),
  
  // Diet Entry Schemas
  createDietEntry: z.object({
    body: z.object({
      foodId: z.number({
        required_error: 'Food item ID is required'
      }).int().positive('Food item ID must be positive'),
      quantity: z.number({
        required_error: 'Quantity is required'
      }).positive('Quantity must be positive'),
      consumptionDate: z.string({
        required_error: 'Consumption date is required'
      }).refine(val => !isNaN(Date.parse(val)), {
        message: 'Consumption date must be a valid date string'
      }),
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
        errorMap: () => ({ message: 'Meal type must be one of: breakfast, lunch, dinner, snack' })
      }).optional(),
      notes: z.string().optional()
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional()
  }),
  
  updateDietEntry: z.object({
    body: z.object({
      foodId: z.number().int().positive('Food item ID must be positive').optional(),
      quantity: z.number().positive('Quantity must be positive').optional(),
      consumptionDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Consumption date must be a valid date string'
      }).optional(),
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
        errorMap: () => ({ message: 'Meal type must be one of: breakfast, lunch, dinner, snack' })
      }).optional(),
      notes: z.string().optional()
    }),
    query: z.object({}).optional(),
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Diet entry ID must be a number'
      })
    })
  }),
  
  getDietEntry: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Diet entry ID must be a number'
      })
    }),
    query: z.object({}).optional(),
    body: z.object({}).optional()
  }),
  
  getUserDietEntries: z.object({
    query: z.object({
      startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Start date must be a valid date string'
      }).optional(),
      endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'End date must be a valid date string'
      }).optional(),
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
        errorMap: () => ({ message: 'Meal type must be one of: breakfast, lunch, dinner, snack' })
      }).optional(),
      page: z.string().optional().transform(val => val ? parseInt(val) : 1),
      limit: z.string().optional().transform(val => val ? parseInt(val) : 20)
    }),
    body: z.object({}).optional(),
    params: z.object({}).optional()
  }),
  
  getUserDietSummary: z.object({
    query: z.object({
      startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Start date must be a valid date string'
      }).optional(),
      endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'End date must be a valid date string'
      }).optional()
    }),
    body: z.object({}).optional(),
    params: z.object({}).optional()
  })
};

module.exports = { dietSchemas };