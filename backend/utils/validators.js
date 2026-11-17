const { body } = require('express-validator');

/** Validation rules for customer registration */
const registerCustomerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Valid 10-digit Indian phone number is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

/** Validation rules for rider registration */
const registerRiderValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Valid 10-digit Indian phone number is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('licenceNumber').trim().notEmpty().withMessage('Licence number is required'),
  body('vehicleRegNumber').trim().notEmpty().withMessage('Vehicle registration number is required'),
];

/** Validation rules for login */
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/** Validation rules for booking a ride */
const bookRideValidation = [
  body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required'),
  body('pickupLat').isFloat({ min: -90, max: 90 }).withMessage('Valid pickup latitude required'),
  body('pickupLng').isFloat({ min: -180, max: 180 }).withMessage('Valid pickup longitude required'),
  body('destinationAddress').trim().notEmpty().withMessage('Destination address is required'),
  body('destinationLat').isFloat({ min: -90, max: 90 }).withMessage('Valid destination latitude required'),
  body('destinationLng').isFloat({ min: -180, max: 180 }).withMessage('Valid destination longitude required'),
  body('distance').isFloat({ min: 0.1 }).withMessage('Distance must be a positive number (km)'),
  body('paymentMethod').optional().isIn(['cash', 'online']).withMessage('Payment method must be cash or online'),
];

/** Validation rules for updating rider location */
const updateLocationValidation = [
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
];

/** Validation rules for creating a rating */
const createRatingValidation = [
  body('rideId').isMongoId().withMessage('Valid ride ID required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().trim(),
];

module.exports = {
  registerCustomerValidation,
  registerRiderValidation,
  loginValidation,
  bookRideValidation,
  updateLocationValidation,
  createRatingValidation,
};
