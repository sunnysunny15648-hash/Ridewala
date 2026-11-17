const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'ridewala_super_secret_jwt_key_change_this_in_production_2024';
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Start server (connectDB handles both real MongoDB and resilient in-memory mode)
connectDB()
  .catch((err) => {
    console.error('Database initialization warning:', err.message);
  })
  .finally(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n======================================================`);
      console.log(`🚀 RideWala Backend is ONLINE on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
      console.log(`👤 Customer Portal: http://localhost:5173`);
      console.log(`🏍️ Rider Captain:    http://localhost:5174`);
      console.log(`🛡️ Admin Dashboard:  http://localhost:5175`);
      console.log(`======================================================\n`);
    });
  });

// Handle unhandled promise rejections without crashing the entire app
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection Notice:', err.message);
});
