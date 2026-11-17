/**
 * Role-based access control middleware.
 * All functions assume authenticate() has already run.
 */

/** Allow only customers */
const requireCustomer = (req, res, next) => {
  if (req.user && req.user.role === 'customer') return next();
  return res.status(403).json({ success: false, message: 'Access denied: customers only' });
};

/** Allow only riders */
const requireRider = (req, res, next) => {
  if (req.user && req.user.role === 'rider') return next();
  return res.status(403).json({ success: false, message: 'Access denied: riders only' });
};

/** Allow only admins */
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Access denied: admins only' });
};

/** Allow customers or admins */
const requireCustomerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'customer' || req.user.role === 'admin')) return next();
  return res.status(403).json({ success: false, message: 'Access denied' });
};

module.exports = { requireCustomer, requireRider, requireAdmin, requireCustomerOrAdmin };
