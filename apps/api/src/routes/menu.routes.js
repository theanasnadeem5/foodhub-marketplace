const express  = require('express');
const router   = express.Router();
const MenuItem = require('../models/MenuItem');
const { authenticate, authorize, scopeToVendor } = require('../middleware/auth.middleware');

// GET /api/v1/menu/:vendorId
router.get('/:vendorId', async (req, res, next) => {
  try {
    const items = await MenuItem.find({ vendorId: req.params.vendorId, isAvailable: true });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

// POST /api/v1/menu/:vendorId
router.post('/:vendorId', authenticate, authorize('VENDOR_MANAGER','SUPER_ADMIN'), scopeToVendor, async (req, res, next) => {
  try {
    const item = await MenuItem.create({ ...req.body, vendorId: req.params.vendorId });
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
});

// PATCH /api/v1/menu/:vendorId/items/:itemId
router.patch('/:vendorId/items/:itemId', authenticate, authorize('VENDOR_MANAGER','SUPER_ADMIN'), scopeToVendor, async (req, res, next) => {
  try {
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.itemId, vendorId: req.params.vendorId },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
});

// DELETE /api/v1/menu/:vendorId/items/:itemId
router.delete('/:vendorId/items/:itemId', authenticate, authorize('VENDOR_MANAGER','SUPER_ADMIN'), scopeToVendor, async (req, res, next) => {
  try {
    await MenuItem.findOneAndUpdate(
      { _id: req.params.itemId, vendorId: req.params.vendorId },
      { isAvailable: false }
    );
    res.json({ success: true, message: 'Item removed from menu' });
  } catch (err) { next(err); }
});

module.exports = router;
