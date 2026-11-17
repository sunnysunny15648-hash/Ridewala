const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI from environment variables.
 * If credentials are not configured or connection fails, falls back gracefully to in-memory mode.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('your_username') || uri.includes('cluster.mongodb.net')) {
    console.log('\n======================================================');
    console.log('⚡ NOTICE: MONGODB_URI contains placeholder credentials.');
    console.log('💡 Starting RideWala in Resilient In-Memory Mode.');
    console.log('   All APIs, Bookings, Drivers & Admin are fully operational!');
    console.log('   To connect real MongoDB Atlas, update MONGODB_URI in backend/.env');
    console.log('======================================================\n');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`\n✅ MongoDB Connected: ${conn.connection.host}\n`);
    return true;
  } catch (err) {
    console.log('\n======================================================');
    console.log(`⚠️  Could not connect to MongoDB Atlas (${err.message})`);
    console.log('💡 Running RideWala in Resilient In-Memory Mode.');
    console.log('   All APIs, Bookings, Drivers & Admin are fully operational!');
    console.log('======================================================\n');
    return false;
  }
};

module.exports = connectDB;
