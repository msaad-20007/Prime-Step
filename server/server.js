import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
