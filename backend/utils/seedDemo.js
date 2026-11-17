// Seed demo customer and rider accounts for testing
// Usage: node backend/utils/seedDemo.js

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const seedDemo = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const User = require('../models/User');
  const Rider = require('../models/Rider');

  const hashedPassword = await bcrypt.hash('Demo@123', 12);

  // Demo Customer
  let customer = await User.findOne({ email: 'customer@demo.com' });
  if (!customer) {
    customer = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@demo.com',
      phone: '9876543210',
      password: hashedPassword,
      role: 'customer',
      isActive: true,
    });
    console.log('🎉 Demo customer created: customer@demo.com / Demo@123');
  } else {
    console.log('ℹ️  Demo customer already exists: customer@demo.com');
  }

  // Demo Rider (Approved & Online)
  let rider = await Rider.findOne({ email: 'captain@demo.com' });
  if (!rider) {
    rider = await Rider.create({
      name: 'Amit Kumar',
      email: 'captain@demo.com',
      phone: '9876543211',
      password: hashedPassword,
      licenceNumber: 'DL1420110012345',
      vehicleRegNumber: 'DL01AB1234',
      vehicleModel: 'Honda Activa 6G',
      role: 'rider',
      isApproved: true,
      isOnline: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.209, 28.6139], // [lng, lat] Delhi
      },
      rating: 4.9,
      totalRides: 48,
      isActive: true,
    });
    console.log('🎉 Demo rider created: captain@demo.com / Demo@123');
  } else {
    console.log('ℹ️  Demo rider already exists: captain@demo.com');
  }

  process.exit(0);
};

seedDemo().catch((err) => {
  console.error('❌ Error seeding demo accounts:', err.message);
  process.exit(1);
});

