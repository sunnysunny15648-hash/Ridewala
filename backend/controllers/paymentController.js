const crypto = require('crypto');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Ride = require('../models/Ride');
const inMemoryStore = require('../services/inMemoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

/** Initialize Razorpay instance if configured */
const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || key_id.includes('your_') || !key_secret || key_secret.includes('your_')) {
    return null;
  }
  return new Razorpay({ key_id, key_secret });
};

/**
 * @desc    Create a Razorpay order for a ride payment
 * @route   POST /api/payments/create-order
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { rideId } = req.body;
    if (!rideId) return res.status(400).json({ success: false, message: 'rideId is required' });

    let ride;
    if (isDbConnected()) {
      ride = await Ride.findById(rideId);
    } else {
      ride = inMemoryStore.rides.find((r) => r._id === rideId);
    }

    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    const amountInPaise = Math.round((ride.actualFare || ride.estimatedFare || 50) * 100);
    const razorpay = getRazorpay();

    if (razorpay) {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `ride_${rideId}`,
        notes: { rideId: rideId.toString() },
      });

      return res.status(200).json({
        success: true,
        orderId: order.id,
        order: { id: order.id, amount: order.amount },
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    // Mock order for development / testing without live Razorpay keys
    const mockOrderId = `order_mock_${Date.now()}`;
    res.status(200).json({
      success: true,
      orderId: mockOrderId,
      order: { id: mockOrderId, amount: amountInPaise },
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
      mock: true,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify Razorpay payment signature and update records
 * @route   POST /api/payments/verify
 * @access  Private
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { rideId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isMock = !keySecret || keySecret.includes('your_') || razorpay_order_id?.startsWith('order_mock');

    if (!isMock) {
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
    }

    if (isDbConnected()) {
      await Payment.findOneAndUpdate(
        { rideId },
        {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature || 'mock_sig',
          status: 'completed',
        },
        { upsert: true, new: true }
      );
      await Ride.findByIdAndUpdate(rideId, { paymentStatus: 'completed' });
    } else {
      const ride = inMemoryStore.rides.find((r) => r._id === rideId);
      if (ride) ride.paymentStatus = 'completed';
    }

    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Handle Razorpay webhook events
 * @route   POST /api/payments/webhook
 * @access  Public
 */
const handleWebhook = async (req, res, next) => {
  try {
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, verifyPayment, handleWebhook };
