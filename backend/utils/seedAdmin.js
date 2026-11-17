// Run this once to create the initial admin user
// Usage (from ridewala/ root): node backend/utils/seedAdmin.js

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
};

const seedAdmin = async () => {
  await connectDB();

  // Require Admin model after connecting
  const Admin = require('../models/Admin');

  const existing = await Admin.findOne({ email: 'admin@ridewala.in' });
  if (existing) {
    console.log('ℹ️  Admin already exists: admin@ridewala.in');
  } else {
    const password = await bcrypt.hash('Admin@12345', 12);
    await Admin.create({
      name: 'RideWala Admin',
      email: 'admin@ridewala.in',
      password,
      role: 'admin',
    });
    console.log('🎉 Admin created successfully!');
    console.log('   Email   : admin@ridewala.in');
    console.log('   Password: Admin@12345');
    console.log('   ⚠️  Change this password after first login!');
  }

  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('❌ Error seeding admin:', err.message);
  process.exit(1);
});
