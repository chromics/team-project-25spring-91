// // backend/src/middleware/auth.js
// const admin = require('../config/firebase');

// const verifyToken = async (req, res, next) => {
//   const startTime = Date.now();
//   try {
//     const authHeader = req.headers.authorization;
//     console.log('Auth header received:', authHeader ? 'Yes' : 'No');
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ error: 'No token provided' });
//     }

//     const token = authHeader.split('Bearer ')[1];
//     console.log('Token verification starting...');

//     try {
//       const decodedToken = await admin.auth().verifyIdToken(token);
//       const duration = Date.now() - startTime;
//       console.log(`✅ Token verified in ${duration}ms for:`, decodedToken.email);
//       req.user = decodedToken;
//       next();
//     } catch (verifyError) {
//       console.error('❌ Token verification failed:', verifyError);
//       res.status(401).json({ error: 'Invalid token' });
//     }
//   } catch (error) {
//     console.error('❌ Auth middleware error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// module.exports = verifyToken;

const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required');
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new ApiError(401, 'Authentication token is required');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      throw new ApiError(401, 'User not found');
    }
    
    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      displayName: user.displayName
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token expired'));
    }
    next(error);
  }
};

module.exports = { authMiddleware };