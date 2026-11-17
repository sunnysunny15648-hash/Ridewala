const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate requests using Bearer JWT tokens.
 * Attaches req.user = { id, role } on success.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'ridewala_super_secret_jwt_key_change_this_in_production_2024';
    const decoded = jwt.verify(token, secret);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

authenticate.protect = authenticate;
authenticate.authenticate = authenticate;

module.exports = authenticate;
module.exports.protect = authenticate;
module.exports.authenticate = authenticate;
