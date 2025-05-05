const { z } = require('zod');

const bookingSchemas = {
  getBooking: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Booking ID must be a number'
      })
    })
  }),
  
  createBooking: z.object({
    body: z.object({
      scheduleId: z.number().int().positive('Schedule ID is required'),
      membershipId: z.number().int().positive('Membership ID is required')
    })
  }),
  
  cancelBooking: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Booking ID must be a number'
      })
    }),
    body: z.object({
      cancellationReason: z.string().optional()
    })
  }),
  
  markAttended: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Booking ID must be a number'
      })
    })
  })
};

module.exports = { bookingSchemas };