const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  vendorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  category:    { type: String, required: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  imageUrl:    { type: String, default: '' },
  price:       { type: Number, required: true, min: 0 },
  isVeg:       { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
  sortOrder:   { type: Number, default: 0 },
  totalOrdered:{ type: Number, default: 0 },
  addons: [{
    name:     String,
    price:    Number,
    required: { type: Boolean, default: false }
  }]
}, { timestamps: true });

MenuItemSchema.index({ vendorId: 1, category: 1 });
MenuItemSchema.index({ vendorId: 1, isAvailable: 1 });

module.exports = mongoose.model('MenuItem', MenuItemSchema);
