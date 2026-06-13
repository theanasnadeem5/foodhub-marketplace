const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const Vendor  = require('../models/Vendor');
const { authenticate } = require('../middleware/auth.middleware');

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || 'foodhub-secret-key', { expiresIn: '7d' });

// POST /api/v1/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    const user  = await User.create({ name, email, password, phone });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } }
    });
  } catch (err) { next(err); }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account is deactivated' });

    const token = signToken(user._id);
    let vendorData = null;
    if (user.vendorId) {
      vendorData = await Vendor.findById(user.vendorId).select('name slug status isOpen');
    }

    res.json({
      success: true,
      data: {
        token,
        user: {
          _id:      user._id,
          name:     user.name,
          email:    user.email,
          role:     user.role,
          vendorId: user.vendorId,
          vendor:   vendorData
        }
      }
    });
  } catch (err) { next(err); }
});

// GET /api/v1/auth/me
router.get('/me', authenticate, async (req, res) => {
  let vendorData = null;
  if (req.user.vendorId) {
    vendorData = await Vendor.findById(req.user.vendorId).select('name slug status isOpen logoUrl');
  }
  res.json({
    success: true,
    data: { ...req.user.toObject(), vendor: vendorData }
  });
});

// PATCH /api/v1/auth/profile
router.patch('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

module.exports = router;
