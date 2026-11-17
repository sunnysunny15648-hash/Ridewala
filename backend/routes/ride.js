const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  bookRide,
  getRide,
  getRideHistory,
  acceptRide,
  updateRideStatus,
  cancelRide,
} = require('../controllers/rideController');
const { protect } = require('../middleware/auth');
const { requireCustomer, requireRider } = require('../middleware/roles');

// Book a ride - customer only
router.post(
  '/book',
  protect,
  requireCustomer,
  [
    body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required'),
    body('pickupLat').isFloat().withMessage('Valid pickup latitude is required'),
    body('pickupLng').isFloat().withMessage('Valid pickup longitude is required'),
    body('destinationAddress').trim().notEmpty().withMessage('Destination address is required'),
    body('destinationLat').isFloat().withMessage('Valid destination latitude is required'),
    body('destinationLng').isFloat().withMessage('Valid destination longitude is required'),
    body('distance').isFloat({ min: 0.1 }).withMessage('Distance must be a positive number'),
  ],
  bookRide
);

// Ride history - any authenticated user
router.get('/history', protect, getRideHistory);

// Get a specific ride
router.get('/:id', protect, getRide);

// Accept ride - rider only
router.post('/:id/accept', protect, requireRider, acceptRide);

// Update ride status - rider only
router.patch('/:id/status', protect, requireRider, updateRideStatus);

// Cancel ride - customer or rider
router.post('/:id/cancel', protect, cancelRide);

module.exports = router;

