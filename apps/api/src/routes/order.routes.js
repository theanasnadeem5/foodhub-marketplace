const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const Vendor  = require('../models/Vendor');
const MenuItem= require('../models/MenuItem');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// POST /api/v1/orders — place order (demo payment, always succeeds)
router.post('/', authenticate, authorize('CUSTOMER','SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { cartItems, deliveryAddress, notes } = req.body;
    // cartItems: [{ vendorId, vendorName, items: [{ menuItemId, name, price, quantity, imageUrl }], deliveryFee }]

    let subtotal = 0;
    let deliveryFeeTotal = 0;
    let platformCommission = 0;
    const vendorOrders = [];

    for (const cart of cartItems) {
      const vendor = await Vendor.findById(cart.vendorId);
      if (!vendor) continue;

      const orderItems = cart.items.map(i => ({
        menuItemId: i.menuItemId,
        name:       i.name,
        price:      i.price,
        quantity:   i.quantity,
        imageUrl:   i.imageUrl || '',
        subtotal:   i.price * i.quantity
      }));

      const itemsTotal      = orderItems.reduce((s, i) => s + i.subtotal, 0);
      const deliveryFee     = cart.deliveryFee || vendor.deliveryFee || 0;
      const vendorTotal     = itemsTotal + deliveryFee;
      const commissionAmt   = +(vendorTotal * vendor.commissionRate).toFixed(2);
      const vendorPayout    = +(vendorTotal - commissionAmt).toFixed(2);

      subtotal         += itemsTotal;
      deliveryFeeTotal += deliveryFee;
      platformCommission += commissionAmt;

      vendorOrders.push({
        vendorId:         cart.vendorId,
        vendorName:       vendor.name,
        items:            orderItems,
        itemsTotal,
        deliveryFee,
        vendorTotal,
        commissionAmount: commissionAmt,
        vendorPayout,
        status:           'PENDING',
        estimatedMinutes: vendor.avgDeliveryTime,
        statusHistory:    [{ status: 'PENDING', note: 'Order received' }]
      });

      // Update vendor order count
      await Vendor.findByIdAndUpdate(cart.vendorId, { $inc: { totalOrders: 1 } });
    }

    const tax        = +(subtotal * 0.05).toFixed(2); // 5% GST
    const grandTotal = +(subtotal + deliveryFeeTotal + tax).toFixed(2);

    const order = await Order.create({
      customerId:    req.user._id,
      customerName:  req.user.name,
      vendorOrders,
      deliveryAddress,
      subtotal,
      deliveryFeeTotal,
      taxAmount:     tax,
      grandTotal,
      platformCommission,
      paymentMethod: 'DEMO',
      paymentStatus: 'PAID',
      overallStatus: 'CONFIRMED',
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) { next(err); }
});

// GET /api/v1/orders — customer gets own orders
router.get('/', authenticate, async (req, res, next) => {
  try {
    const query = req.user.role === 'SUPER_ADMIN'
      ? {}
      : { customerId: req.user._id };
    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
});

// GET /api/v1/orders/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    // Customers can only see their own orders
    if (req.user.role === 'CUSTOMER' && order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

// PATCH /api/v1/orders/:orderId/vendor/:vendorOrderId/status — vendor updates status
router.patch('/:orderId/vendor/:vendorOrderId/status', authenticate, authorize('VENDOR_MANAGER','SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const vendorOrder = order.vendorOrders.id(req.params.vendorOrderId);
    if (!vendorOrder) return res.status(404).json({ success: false, message: 'Vendor order not found' });

    // Scope check: vendor manager can only update their own sub-order
    if (req.user.role === 'VENDOR_MANAGER' && vendorOrder.vendorId.toString() !== req.user.vendorId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    vendorOrder.status = status;
    vendorOrder.statusHistory.push({ status, note: note || '' });

    // Update overall order status
    const allStatuses = order.vendorOrders.map(v => v.status);
    if (allStatuses.every(s => s === 'DELIVERED')) order.overallStatus = 'COMPLETED';
    else if (allStatuses.every(s => s === 'CANCELLED')) order.overallStatus = 'CANCELLED';
    else order.overallStatus = 'IN_PROGRESS';

    await order.save();
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

module.exports = router;
