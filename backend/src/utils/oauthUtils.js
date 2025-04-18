const jwt = require('jsonwebtoken');

const generateTokenForOAuthUser = (user) => {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = { generateTokenForOAuthUser };