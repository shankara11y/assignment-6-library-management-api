/**
 * Role Authorization Middleware
 * @param {...string} allowedRoles - List of authorized roles (e.g., 'librarian', 'student')
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking user permissions.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};

module.exports = requireRole;
