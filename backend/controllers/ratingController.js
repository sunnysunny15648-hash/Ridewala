const mongoose = require('mongoose');
const Rating = require('../models/Rating');
const Ride = require('../models/Ride');
const Rider = require('../models/Rider');
const inMemoryStore = require('../services/inMemoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * @desc    Create or update a rating for a completed ride
 * @route   POST /api/ratings
 * @access  Private (customer)
 */
const createRating = async (req, res, next) => {
  try {
    const { rideId, rating, feedback } = req.body;

    if (isDbConnected()) {
      const ride = await Ride.findById(rideId);
      if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
      if (ride.status !== 'completed') {
        return res.status(400).json({ success: false, message: 'You can only rate completed rides' });
      }

      await Rating.findOneAndUpdate(
        { rideId },
        { rideId, customerId: req.user.id, riderId: ride.riderId, rating, feedback: feedback || '' },
        { upsert: true, new: true }
      );

      return res.status(200).json({ success: true, message: 'Rating submitted successfully' });
    }

    // In-memory fallback
    const ride = inMemoryStore.rides.find((r) => r._id === rideId);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    let existing = inMemoryStore.ratings.find((rt) => rt.rideId === rideId);
    if (existing) {
      existing.rating = rating;
      existing.feedback = feedback || '';
    } else {
      inMemoryStore.ratings.push({
        _id: inMemoryStore.generateId(),
        rideId,
        customerId: req.user.id,
        riderId: ride.riderId,
        rating,
        feedback: feedback || '',
        createdAt: new Date(),
      });
    }

    res.status(200).json({ success: true, message: 'Rating submitted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get paginated ratings for a specific rider
 * @route   GET /api/ratings/rider/:riderId?page=1&limit=10
 * @access  Public
 */
const getRiderRatings = async (req, res, next) => {
  try {
    const { riderId } = req.params;

    if (isDbConnected()) {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;

      const [ratings, total, rider] = await Promise.all([
        Rating.find({ riderId }).populate('customerId', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Rating.countDocuments({ riderId }),
        Rider.findById(riderId).select('name rating totalRides'),
      ]);

      return res.status(200).json({ success: true, rider, data: ratings, total });
    }

    const ratings = inMemoryStore.ratings.filter((rt) => rt.riderId === riderId);
    const rider = inMemoryStore.riders.find((r) => r._id === riderId) || { name: 'Amit Kumar', rating: 4.9 };

    res.status(200).json({ success: true, rider, data: ratings, total: ratings.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { createRating, getRiderRatings };
