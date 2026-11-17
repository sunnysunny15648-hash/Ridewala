const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'ridewala_super_secret_jwt_key_change_this_in_production_2024';
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS - allow all RideWala frontend portals (Customer 5173, Rider 5174, Admin 5175)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman) or matching whitelist
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers (payment webhook uses raw body - must be before express.json())
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', apiLimiter);

// Root landing
app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>RideWala API</title>
      <style>
        body { font-family: sans-serif; background: #111; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; flex-direction: column; }
        h1 { color: #FFC928; font-size: 2.5rem; margin-bottom: 0.5rem; }
        p { color: #9CA3AF; margin: 0.25rem 0; }
        .badge { background: #16A34A; color: #fff; padding: 4px 14px; border-radius: 999px; font-size: 0.85rem; margin-top: 1rem; display: inline-block; }
        a { color: #FFC928; text-decoration: none; }
        .links { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; text-align: center; }
      </style>
    </head>
    <body>
      <h1>🏍️ RideWala</h1>
      <span class="badge">✅ Backend API is ONLINE</span>
      <div class="links">
        <p><a href="/health">❤️ Health Check</a></p>
        <p>👤 Customer App: <a href="http://localhost:5173">localhost:5173</a></p>
        <p>🏍️ Rider App: <a href="http://localhost:5174">localhost:5174</a></p>
        <p>🛡️ Admin Dashboard: <a href="http://localhost:5175">localhost:5175</a></p>
      </div>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'RideWala API is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customer'));
app.use('/api/riders', require('./routes/rider'));
app.use('/api/rides', require('./routes/ride'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/ratings', require('./routes/rating'));
app.use('/api/admin', require('./routes/admin'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;

