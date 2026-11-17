const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  registerCustomer,
  loginUser,
  getMe,
  registerRider,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Customer registration
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  registerCustomer
);

// Login (customers + riders + admin)
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginUser
);

// Get current user
router.get('/me', protect, getMe);

// Rider registration
router.post(
  '/register-rider',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('licenceNumber').trim().notEmpty().withMessage('Licence number is required'),
    body('vehicleRegNumber').trim().notEmpty().withMessage('Vehicle registration number is required'),
    body('vehicleModel').trim().notEmpty().withMessage('Vehicle model is required'),
  ],
  registerRider
);

module.exports = router;

