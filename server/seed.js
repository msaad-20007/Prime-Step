import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';

dotenv.config();

const products = [
  {
    name: 'Air Phantom X',
    brand: 'NovaSole',
    description: 'Lightweight performance runner with reactive foam cushioning and a breathable mesh upper.',
    price: 189.99,
    discountPrice: 149.99,
    category: 'Running',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
    ],
    sizes: [
      { size: 'US 7', stock: 5 },
      { size: 'US 8', stock: 8 },
      { size: 'US 9', stock: 12 },
      { size: 'US 10', stock: 10 },
      { size: 'US 11', stock: 6 },
      { size: 'US 12', stock: 3 },
    ],
  },
  {
    name: 'Cyber Force 1',
    brand: 'UrbanEdge',
    description: 'Classic low-top silhouette reimagined with holographic accents and premium leather.',
    price: 220.00,
    discountPrice: null,
    category: 'Lifestyle',
    images: [
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
    ],
    sizes: [
      { size: 'US 7', stock: 4 },
      { size: 'US 8', stock: 7 },
      { size: 'US 9', stock: 9 },
      { size: 'US 10', stock: 11 },
      { size: 'US 11', stock: 5 },
      { size: 'US 12', stock: 2 },
    ],
  },
  {
    name: 'Neon Drift Pro',
    brand: 'VoltKick',
    description: 'High-top skate shoe with vulcanized sole and neon-accented tongue.',
    price: 145.00,
    discountPrice: 119.00,
    category: 'Skate',
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
      'https://images.unsplash.com/photo-1584735175315-9d5df23be620?w=800&q=80',
    ],
    sizes: [
      { size: 'US 7', stock: 6 },
      { size: 'US 8', stock: 9 },
      { size: 'US 9', stock: 14 },
      { size: 'US 10', stock: 8 },
      { size: 'US 11', stock: 4 },
      { size: 'US 12', stock: 0 },
    ],
  },
  {
    name: 'Shadow Runner Elite',
    brand: 'DarkStride',
    description: 'All-black stealth runner with carbon fibre plate and matte finish.',
    price: 299.99,
    discountPrice: null,
    category: 'Running',
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
    ],
    sizes: [
      { size: 'US 7', stock: 3 },
      { size: 'US 8', stock: 5 },
      { size: 'US 9', stock: 7 },
      { size: 'US 10', stock: 9 },
      { size: 'US 11', stock: 6 },
      { size: 'US 12', stock: 4 },
    ],
  },
  {
    name: 'Luxe Court Low',
    brand: 'UrbanEdge',
    description: 'Tennis-inspired court shoe with full-grain leather and gold hardware.',
    price: 265.00,
    discountPrice: 199.00,
    category: 'Lifestyle',
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
    ],
    sizes: [
      { size: 'US 7', stock: 5 },
      { size: 'US 8', stock: 8 },
      { size: 'US 9', stock: 10 },
      { size: 'US 10', stock: 7 },
      { size: 'US 11', stock: 3 },
      { size: 'US 12', stock: 1 },
    ],
  },
  {
    name: 'Pulse Trail GTX',
    brand: 'NovaSole',
    description: 'Waterproof trail runner with aggressive lug sole and Gore-Tex lining.',
    price: 175.00,
    discountPrice: null,
    category: 'Trail',
    images: [
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80',
      'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&q=80',
    ],
    sizes: [
      { size: 'US 7', stock: 4 },
      { size: 'US 8', stock: 6 },
      { size: 'US 9', stock: 8 },
      { size: 'US 10', stock: 10 },
      { size: 'US 11', stock: 7 },
      { size: 'US 12', stock: 5 },
    ],
  },
  {
    name: 'Glitch High OG',
    brand: 'VoltKick',
    description: 'Retro basketball high-top with distressed leather and gum sole.',
    price: 210.00,
    discountPrice: 175.00,
    category: 'Basketball',
    images: [
      'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800&q=80',
      'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=800&q=80',
    ],
    sizes: [
      { size: 'US 7', stock: 2 },
      { size: 'US 8', stock: 5 },
      { size: 'US 9', stock: 9 },
      { size: 'US 10', stock: 11 },
      { size: 'US 11', stock: 8 },
      { size: 'US 12', stock: 4 },
    ],
  },
  {
    name: 'Void Walker',
    brand: 'DarkStride',
    description: 'Chunky platform sneaker with exaggerated sole stack and reflective panels.',
    price: 320.00,
    discountPrice: null,
    category: 'Lifestyle',
    images: [
      'https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=800&q=80',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&q=80',
    ],
    sizes: [
      { size: 'US 7', stock: 3 },
      { size: 'US 8', stock: 6 },
      { size: 'US 9', stock: 8 },
      { size: 'US 10', stock: 5 },
      { size: 'US 11', stock: 2 },
      { size: 'US 12', stock: 0 },
    ],
  },
];

async function seed() {
  await connectDB();

  // Clear existing products
  await Product.deleteMany({});
  console.log('Cleared existing products');

  // Insert seed products
  const inserted = await Product.insertMany(products);
  console.log(`Seeded ${inserted.length} products`);

  // Create admin user if not exists
  const adminExists = await User.findOne({ email: 'admin@primestep.com' });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: 'admin@primestep.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Created admin user: admin@primestep.com / admin123');
  } else {
    console.log('Admin user already exists');
  }

  mongoose.connection.close();
  console.log('Done!');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
