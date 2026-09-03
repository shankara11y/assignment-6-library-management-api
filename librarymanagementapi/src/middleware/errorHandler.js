/**
 * Centralized Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('🔥 [Unhandled Server Error]:', err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
