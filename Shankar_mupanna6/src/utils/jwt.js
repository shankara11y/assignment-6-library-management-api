const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for an authenticated user
 * @param {Object} payload - Data to embed in the token (userId, email, role)
 * @returns {string} JWT Token
 */
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'default_jwt_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token - Bearer token string
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'default_jwt_secret_key';
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken,
};
