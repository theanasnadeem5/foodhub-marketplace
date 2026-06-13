const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  phone:    { type: String, default: '' },
  role:     { type: String, enum: ['CUSTOMER', 'VENDOR_MANAGER', 'SUPER_ADMIN'], default: 'CUSTOMER' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', default: null },
  isActive: { type: Boolean, default: true },
  avatar:   { type: String, default: '' },
  savedAddresses: [{
    label:      { type: String, default: 'Home' },
    street:     String,
    city:       String,
    postalCode: String,
    isDefault:  { type: Boolean, default: false }
  }]
}, { timestamps: true });

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);
