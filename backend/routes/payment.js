const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  handleWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
// Webhook endpoint - no auth (Razorpay calls this directly)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;

