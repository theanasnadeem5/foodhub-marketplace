const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  menuItemId:  { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name:        String,
  price:       Number,
  quantity:    { type: Number, min: 1 },
  imageUrl:    String,
  subtotal:    Number,
  addons:      [{ name: String, price: Number }]
}, { _id: true });

const VendorOrderSchema = new mongoose.Schema({
  vendorId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  vendorName:       String,
  items:            [OrderItemSchema],
  itemsTotal:       Number,
  deliveryFee:      { type: Number, default: 0 },
  vendorTotal:      Number,
  commissionAmount: Number,
  vendorPayout:     Number,
  status: {
    type: String,
    enum: ['PENDING','CONFIRMED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'],
    default: 'PENDING'
  },
  estimatedMinutes: { type: Number, default: 30 },
  statusHistory: [{
    status:    String,
    note:      String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { _id: true });

const OrderSchema = new mongoose.Schema({
  orderNumber:  { type: String, unique: true },
  customerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: String,
  vendorOrders: [VendorOrderSchema],
  deliveryAddress: {
    street:     String,
    city:       String,
    postalCode: String
  },
  subtotal:          Number,
  deliveryFeeTotal:  { type: Number, default: 0 },
  taxAmount:         { type: Number, default: 0 },
  grandTotal:        Number,
  platformCommission:Number,
  paymentMethod:     { type: String, default: 'DEMO' },
  paymentStatus:     { type: String, enum: ['PENDING','PAID','FAILED','REFUNDED'], default: 'PAID' },
  overallStatus: {
    type: String,
    enum: ['CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED'],
    default: 'CONFIRMED'
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ 'vendorOrders.vendorId': 1 });
OrderSchema.index({ overallStatus: 1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });

// Auto-generate order number before saving
OrderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const rand = Math.random().toString(36).substring(2,6).toUpperCase();
    this.orderNumber = `ORD-${date}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
