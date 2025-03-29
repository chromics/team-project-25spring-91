// backend/src/middleware/auth.js
const admin = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header received:', authHeader ? 'Yes' : 'No');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Token verification starting...');

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const duration = Date.now() - startTime;
      console.log(`✅ Token verified in ${duration}ms for:`, decodedToken.email);
      req.user = decodedToken;
      next();
    } catch (verifyError) {
      console.error('❌ Token verification failed:', verifyError);
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = verifyToken;