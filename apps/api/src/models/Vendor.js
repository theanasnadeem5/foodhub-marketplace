const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  slug:         { type: String, unique: true },
  description:  { type: String, default: '' },
  logoUrl:      { type: String, default: '' },
  bannerUrl:    { type: String, default: '' },
  cuisineTypes: [String],
  phone:        { type: String, default: '' },
  email:        { type: String, default: '' },
  address: {
    street:     { type: String, default: '' },
    city:       { type: String, default: '' },
    state:      { type: String, default: '' },
    postalCode: { type: String, default: '' }
  },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  avgDeliveryTime: { type: Number, default: 30 },
  minOrderAmount:  { type: Number, default: 0 },
  deliveryFee:     { type: Number, default: 0 },
  isOpen:          { type: Boolean, default: false },
  status:          { type: String, enum: ['PENDING', 'APPROVED', 'SUSPENDED'], default: 'PENDING' },
  commissionRate:  { type: Number, default: 0.15 },
  ratingAvg:       { type: Number, default: 0 },
  ratingCount:     { type: Number, default: 0 },
  totalOrders:     { type: Number, default: 0 },
  ownerId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

VendorSchema.index({ location: '2dsphere' });
VendorSchema.index({ status: 1, isOpen: 1 });
VendorSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Vendor', VendorSchema);
