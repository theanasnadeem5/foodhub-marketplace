const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Vendor  = require('../models/Vendor');
const Order   = require('../models/Order');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All admin routes require SUPER_ADMIN
router.use(authenticate, authorize('SUPER_ADMIN'));

// GET /api/v1/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [users, vendors, orders] = await Promise.all([
      User.countDocuments(),
      Vendor.countDocuments(),
      Order.countDocuments()
    ]);
    const revenue = await Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$platformCommission' }, gmv: { $sum: '$grandTotal' } } }
    ]);
    res.json({
      success: true,
      data: {
        totalUsers: users,
        totalVendors: vendors,
        totalOrders: orders,
        platformRevenue: revenue[0]?.total || 0,
        gmv: revenue[0]?.gmv || 0
      }
    });
  } catch (err) { next(err); }
});

// GET /api/v1/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
});

// PATCH /api/v1/admin/users/:id/role
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// GET /api/v1/admin/vendors
router.get('/vendors', async (req, res, next) => {
  try {
    const vendors = await Vendor.find().populate('ownerId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: vendors });
  } catch (err) { next(err); }
});

// PATCH /api/v1/admin/vendors/:id/status
router.patch('/vendors/:id/status', async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: vendor });
  } catch (err) { next(err); }
});

// GET /api/v1/admin/orders
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100)
      .populate('customerId', 'name email');
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
});

module.exports = router;
