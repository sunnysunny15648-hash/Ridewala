// Seed default pricing settings if none exist
// Usage (from ridewala/ root): node backend/utils/seedPricing.js

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
};

const seedPricing = async () => {
  await connectDB();
  const PricingSettings = require('../models/PricingSettings');

  const existing = await PricingSettings.findOne({ isActive: true });
  if (existing) {
    console.log('ℹ️  Active pricing settings already exist:');
    console.log(existing);
  } else {
    const pricing = await PricingSettings.create({
      baseFare: 20,
      perKmCharge: 8,
      minimumFare: 30,
      waitingChargePerMin: 2,
      commissionPercent: 20,
      isActive: true,
    });
    console.log('🎉 Default pricing created successfully:');
    console.log(pricing);
  }

  process.exit(0);
};

seedPricing().catch((err) => {
  console.error('❌ Error seeding pricing:', err.message);
  process.exit(1);
});

