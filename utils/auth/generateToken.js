const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = {
    user_name: user.full_name,
    user_id: user.user_id,
    email: user.email,
    role: user.role,
    status: user.status
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d' // Default to 1 day if not specified
  });

  return token;
};

module.exports = generateToken;
