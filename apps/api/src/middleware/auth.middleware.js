const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  try {
    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'foodhub-secret-key');
    const user    = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

const scopeToVendor = (req, res, next) => {
  if (req.user.role === 'SUPER_ADMIN') return next();
  const requestedId = req.params.vendorId || req.params.id;
  if (!req.user.vendorId || req.user.vendorId.toString() !== requestedId) {
    return res.status(403).json({ success: false, message: 'You can only manage your own vendor' });
  }
  next();
};

module.exports = { authenticate, authorize, scopeToVendor };
