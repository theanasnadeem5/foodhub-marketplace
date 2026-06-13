require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Vendor   = require('../models/Vendor');
const MenuItem = require('../models/MenuItem');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'foodhub' });
  console.log('Connected to MongoDB');

  // Clear existing
  await Promise.all([User.deleteMany(), Vendor.deleteMany(), MenuItem.deleteMany()]);

  // Create Super Admin
  const admin = await User.create({
    name: 'Super Admin', email: 'admin@foodhub.com', password: 'Admin@123', role: 'SUPER_ADMIN'
  });

  // Create 2 vendor owners
  const owner1 = await User.create({ name: 'Raj Kumar', email: 'raj@pizzapalace.com', password: 'Vendor@123' });
  const owner2 = await User.create({ name: 'Priya Singh', email: 'priya@spicegarden.com', password: 'Vendor@123' });

  // Create vendors
  const v1 = await Vendor.create({
    name: 'Pizza Palace', slug: 'pizza-palace',
    description: 'Authentic Italian pizzas made fresh daily',
    cuisineTypes: ['Italian', 'Pizza'], phone: '9876543210',
    address: { street: 'Park Street', city: 'Kolkata', state: 'WB', postalCode: '700016' },
    location: { type: 'Point', coordinates: [88.3639, 22.5726] },
    avgDeliveryTime: 30, minOrderAmount: 199, deliveryFee: 30,
    isOpen: true, status: 'APPROVED', commissionRate: 0.15,
    ratingAvg: 4.5, ratingCount: 120, ownerId: owner1._id
  });

  const v2 = await Vendor.create({
    name: 'Spice Garden', slug: 'spice-garden',
    description: 'Traditional Indian curries and biryanis',
    cuisineTypes: ['Indian', 'Biryani'], phone: '9876543211',
    address: { street: 'Salt Lake', city: 'Kolkata', state: 'WB', postalCode: '700091' },
    location: { type: 'Point', coordinates: [88.4017, 22.5697] },
    avgDeliveryTime: 40, minOrderAmount: 149, deliveryFee: 25,
    isOpen: true, status: 'APPROVED', commissionRate: 0.15,
    ratingAvg: 4.3, ratingCount: 85, ownerId: owner2._id
  });

  // Link owners to vendors
  await User.findByIdAndUpdate(owner1._id, { vendorId: v1._id, role: 'VENDOR_MANAGER' });
  await User.findByIdAndUpdate(owner2._id, { vendorId: v2._id, role: 'VENDOR_MANAGER' });

  // Menu items for Pizza Palace
  await MenuItem.create([
    { vendorId: v1._id, category: 'Pizzas', name: 'Margherita Pizza', description: 'Classic tomato and mozzarella', price: 299, isVeg: true, isFeatured: true, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
    { vendorId: v1._id, category: 'Pizzas', name: 'Pepperoni Pizza', description: 'Loaded with premium pepperoni', price: 399, isVeg: false, isFeatured: true, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
    { vendorId: v1._id, category: 'Pizzas', name: 'BBQ Chicken Pizza', description: 'Smoky BBQ sauce with grilled chicken', price: 449, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },
    { vendorId: v1._id, category: 'Sides', name: 'Garlic Bread', description: 'Crispy garlic butter bread', price: 99, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1619531038896-e84a70c3a2ab?w=400' },
    { vendorId: v1._id, category: 'Drinks', name: 'Coca Cola', description: '330ml chilled can', price: 49, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400' },
  ]);

  // Menu items for Spice Garden
  await MenuItem.create([
    { vendorId: v2._id, category: 'Biryani', name: 'Chicken Biryani', description: 'Aromatic basmati with tender chicken', price: 249, isVeg: false, isFeatured: true, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
    { vendorId: v2._id, category: 'Biryani', name: 'Veg Biryani', description: 'Fresh vegetables in fragrant rice', price: 199, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
    { vendorId: v2._id, category: 'Curries', name: 'Butter Chicken', description: 'Creamy tomato-based curry', price: 279, isVeg: false, isFeatured: true, imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
    { vendorId: v2._id, category: 'Curries', name: 'Paneer Tikka Masala', description: 'Cottage cheese in spiced gravy', price: 239, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
    { vendorId: v2._id, category: 'Breads', name: 'Garlic Naan', description: 'Soft leavened bread from tandoor', price: 59, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
  ]);

  // Create a sample customer
  await User.create({ name: 'Aarav Shah', email: 'customer@foodhub.com', password: 'Customer@123', role: 'CUSTOMER' });

  console.log('\n✅ Seed complete! Login credentials:');
  console.log('👑 Admin:    admin@foodhub.com    / Admin@123');
  console.log('🍕 Vendor 1: raj@pizzapalace.com  / Vendor@123');
  console.log('🍛 Vendor 2: priya@spicegarden.com / Vendor@123');
  console.log('👤 Customer: customer@foodhub.com / Customer@123');

  await mongoose.disconnect();
}

seed().catch(console.error);
