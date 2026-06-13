const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes   = require('./routes/auth.routes');
const vendorRoutes = require('./routes/vendor.routes');
const menuRoutes   = require('./routes/menu.routes');
const orderRoutes  = require('./routes/order.routes');
const adminRoutes  = require('./routes/admin.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => res.json({
  status: 'ok',
  message: 'FoodHub API is running',
  timestamp: new Date().toISOString()
}));

// Routes
app.use('/api/v1/auth',    authRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/menu',    menuRoutes);
app.use('/api/v1/orders',  orderRoutes);
app.use('/api/v1/admin',   adminRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

module.exports = app;
