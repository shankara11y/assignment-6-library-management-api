/**
 * Custom Logger Middleware - Logs incoming requests with timestamp, method, URL, and user context
 */
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const user = req.user ? req.user.email : 'anonymous';

  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} user=${user}`);
  next();
};

module.exports = logger;
