const jwt = require("jsonwebtoken");

/**
 * Middleware to ensure the request is authenticated via JWT.
 * Expects 'Authorization: Bearer <token>' header.
 * Attaches the decoded user to `req.user`.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * Middleware factory for Role-Based Access Control (RBAC).
 * Requires the user to have one of the specified roles.
 * Must be used AFTER `requireAuth` middleware.
 *
 * @param {...string} roles - List of allowed roles (e.g., 'admin', 'user').
 * @returns {import('express').RequestHandler} Express middleware function.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
