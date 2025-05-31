//tests/utils/auth.js
const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function getAuthHeader(user) {
  const token = generateToken(user);
  return `Bearer ${token}`;
}

module.exports = {
  generateToken,
  getAuthHeader
};