// // backend/src/index.js
// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const verifyToken = require('./middleware/auth');
// const supabase = require('./config/supabase');

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 6000;

// app.use(cors());
// app.use(express.json());

// // GET all items
// app.get('/api/test', (req, res, next) => {
//   const requestTimeout = setTimeout(() => {
//     res.status(504).json({ error: 'Request timeout' });
//   }, 10000); // 10 second timeout

//   verifyToken(req, res, () => {
//     const startTime = Date.now();
//     console.log('Starting database query...');

//     supabase
//       .from('test')
//       .select('*')
//       .order('created_at', { ascending: false })
//       .then(({ data, error }) => {
//         clearTimeout(requestTimeout);
//         if (error) {
//           console.error('Database error:', error);
//           return res.status(500).json({ error: error.message });
//         }
//         const duration = Date.now() - startTime;
//         console.log(`Query completed in ${duration}ms`);
//         res.json(data);
//       })
//       .catch(error => {
//         clearTimeout(requestTimeout);
//         console.error('Server error:', error);
//         res.status(500).json({ error: 'Server error' });
//       });
//   });
// });
// // backend/src/index.js
// // POST new item
// app.post('/api/test', (req, res, next) => {
//   console.log('1. Request received');
//   const startTime = Date.now();

//   verifyToken(req, res, () => {
//     console.log('2. Token verified, processing request');
//     const { txt } = req.body;
    
//     if (!txt || typeof txt !== 'string') {
//       return res.status(400).json({ error: 'Invalid input' });
//     }

//     console.log('3. Starting Supabase insert:', { txt });

//     supabase
//       .from('test')
//       .insert([{ txt }])
//       .select()
//       .then(({ data, error }) => {
//         if (error) {
//           console.error('4. ❌ Supabase error:', error);
//           return res.status(500).json({ error: error.message });
//         }
//         const duration = Date.now() - startTime;
//         console.log(`4. ✅ Insert successful in ${duration}ms:`, data[0]);
//         res.json(data[0]);
//       })
//       .catch(error => {
//         console.error('4. ❌ Server error:', error);
//         res.status(500).json({ error: 'Server error' });
//       });
//   });
// });

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { authMiddleware } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const exerciseRoutes = require('./routes/exercises.routes');
const plannedRoutes = require('./routes/planned.routes');
const actualRoutes = require('./routes/actual.routes');
const statisticsRoutes = require('./routes/statistics.routes');

// Initialize express app
const app = express();
const PORT =  5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/exercises', authMiddleware, exerciseRoutes);
app.use('/api/planned-workouts', authMiddleware, plannedRoutes);
app.use('/api/actual-workouts', authMiddleware, actualRoutes);
app.use('/api/statistics', authMiddleware, statisticsRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing