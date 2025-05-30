// // src/services/nogifications.service.js
// const cron = require('node-cron');
// const nodemailer = require('nodemailer');
// const prisma = require('../config/prisma');

// // Initialize email transporter
// let transporter;
// if (process.env.NODE_ENV === 'production') {
//   transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     secure: process.env.EMAIL_SECURE === 'true',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     }
//   });
// } else {
//   // Use ethereal.email for development
//   // You can view the emails at ethereal.email using the credentials from the console
//   console.log('Using test email account for development');
// }

// const notificationService = {
//   // Initialize notification system
//   init: () => {
//     // Schedule a daily job to check for workouts and send reminders
//     cron.schedule('0 7 * * *', async () => {
//       console.log('Running daily workout reminder check');
//       await notificationService.sendWorkoutReminders();
//     });
    
//     console.log('Notification system initialized');
//   },
  
//   // Schedule a reminder for a specific workout
//   scheduleWorkoutReminder: async (workout) => {
//     // This function doesn't actually schedule a specific reminder
//     // Instead, we rely on the daily cron job and the reminderSent flag
//     // We just log the action for clarity
//     console.log(`Workout reminder scheduled for workout ${workout.id} on ${workout.scheduledDate}`);
//     return true;
//   },
  
//   // Cancel a reminder for a specific workout
//   cancelWorkoutReminder: async (workoutId) => {
//     // Since we use a flag-based approach, no actual cancellation is needed
//     console.log(`Workout reminder cancelled for workout ${workoutId}`);
//     return true;
//   },
  
// // Send reminders for all upcoming workouts
// sendWorkoutReminders: async () => {
//     const today = new Date();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);
    
//     // Format dates to match only the date part
//     const todayStr = today.toISOString().split('T')[0];
//     const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
//     // Find workouts scheduled for today or tomorrow that haven't had reminders sent
//     const upcomingWorkouts = await prisma.plannedWorkout.findMany({
//       where: {
//         scheduledDate: {
//           gte: new Date(todayStr),
//           lt: new Date(tomorrowStr + 'T23:59:59')
//         },
//         reminderSent: false
//       },
//       include: {
//         user: {
//           select: {
//             email: true,
//             displayName: true
//           }
//         },
//         plannedExercises: {
//           include: {
//             exercise: true
//           }
//         }
//       }
//     });
    
//     console.log(`Found ${upcomingWorkouts.length} workouts to send reminders for`);
    
//     // Send email for each workout
//     const reminderPromises = upcomingWorkouts.map(async (workout) => {
//       try {
//         // Skip if user has no email
//         if (!workout.user.email) {
//           console.log(`No email for user for workout ${workout.id}`);
//           return;
//         }
        
//         // Format workout details for email
//         const exerciseList = workout.plannedExercises
//           .map(pe => {
//             let details = `${pe.exercise.name}`;
            
//             if (pe.plannedSets && pe.plannedReps) {
//               details += ` - ${pe.plannedSets} sets of ${pe.plannedReps} reps`;
//             } else if (pe.plannedDuration) {
//               details += ` - ${pe.plannedDuration} minutes`;
//             }
            
//             if (pe.plannedWeight) {
//               details += ` at ${pe.plannedWeight}kg`;
//             }
            
//             return details;
//           })
//           .join('\n- ');
        
//         // Format email content
//         const emailSubject = `Workout Reminder: ${workout.title} today`;
//         const emailContent = `
//           <h2>Workout Reminder</h2>
//           <p>Hello ${workout.user.displayName || 'there'},</p>
//           <p>This is a reminder about your scheduled workout today:</p>
//           <h3>${workout.title}</h3>
//           <p><strong>Scheduled for:</strong> ${workout.scheduledDate.toLocaleDateString()}</p>
//           ${workout.estimatedDuration ? `<p><strong>Estimated duration:</strong> ${workout.estimatedDuration} minutes</p>` : ''}
          
//           <h4>Exercises:</h4>
//           <ul>
//             ${workout.plannedExercises.map(pe => {
//               let details = `<li><strong>${pe.exercise.name}</strong>`;
              
//               if (pe.plannedSets && pe.plannedReps) {
//                 details += ` - ${pe.plannedSets} sets of ${pe.plannedReps} reps`;
//               } else if (pe.plannedDuration) {
//                 details += ` - ${pe.plannedDuration} minutes`;
//               }
              
//               if (pe.plannedWeight) {
//                 details += ` at ${pe.plannedWeight}kg`;
//               }
              
//               return details + '</li>';
//             }).join('')}
//           </ul>
          
//           <p>Remember to log your workout after you complete it!</p>
//           <p>Stay strong,<br>Your Workout Tracker</p>
//         `;
        
//         // In production, send the actual email
//         if (process.env.NODE_ENV === 'production' && transporter) {
//           await transporter.sendMail({
//             from: `"Workout Tracker" <${process.env.EMAIL_FROM}>`,
//             to: workout.user.email,
//             subject: emailSubject,
//             html: emailContent
//           });
//         } else {
//           // In development, just log it
//           console.log(`Would send email to ${workout.user.email}: ${emailSubject}`);
//           console.log('Email content preview:', emailContent.substring(0, 100) + '...');
//         }
        
//         // Mark reminder as sent
//         await prisma.plannedWorkout.update({
//           where: { id: workout.id },
//           data: { reminderSent: true }
//         });
        
//         console.log(`Reminder sent for workout ${workout.id}`);
//         return true;
//       } catch (error) {
//         console.error(`Error sending reminder for workout ${workout.id}:`, error);
//         return false;
//       }
//     });
    
//     // Wait for all reminders to be processed
//     const results = await Promise.all(reminderPromises);
//     const sentCount = results.filter(result => result === true).length;
    
//     console.log(`Sent ${sentCount} reminders out of ${upcomingWorkouts.length} scheduled workouts`);
//     return sentCount;
//   }
  
//   };
  
//   // Initialize notification system when this module is imported
//   if (process.env.NODE_ENV === 'production' || process.env.ENABLE_NOTIFICATIONS === 'true') {
//     notificationService.init();
//   }
  
//   module.exports = { notificationService };