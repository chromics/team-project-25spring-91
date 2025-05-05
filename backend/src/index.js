require('dotenv').config(); //need to be at the top, so i can call variables from .env
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { authMiddleware } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { setupOAuth } = require('./config/oauth');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const exerciseRoutes = require('./routes/exercises.routes');
const plannedRoutes = require('./routes/planned.routes');
const actualRoutes = require('./routes/actual.routes');
const statisticsRoutes = require('./routes/statistics.routes');

//gym routes
const gymRoutes = require('./routes/gym.routes');
const membershipRoutes = require('./routes/membership.routes');
const classRoutes = require('./routes/class.routes');
const bookingRoutes = require('./routes/booking.routes');

// Initialize express app
const app = express();
const PORT = 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Add this to fix CORP error
  crossOriginOpenerPolicy: false   // Add this if needed
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'workout-tracker-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  proxy: true
}));

// Setup OAuth with Passport
const passport = setupOAuth();
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/exercises', authMiddleware, exerciseRoutes);
app.use('/api/planned-workouts', authMiddleware, plannedRoutes);
app.use('/api/actual-workouts', authMiddleware, actualRoutes);
app.use('/api/statistics', authMiddleware, statisticsRoutes);
app.use('/api/gyms', authMiddleware, gymRoutes);
app.use('/api/memberships', authMiddleware, membershipRoutes);
app.use('/api/classes', authMiddleware, classRoutes);
app.use('/api/bookings', authMiddleware, bookingRoutes);


// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing