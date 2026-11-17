const mongoose = require('mongoose');
const Rider = require('../models/Rider');
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');
const inMemoryStore = require('../services/inMemoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * @desc    Get rider profile
 * @route   GET /api/riders/profile
 * @access  Private (rider)
 */
const getProfile = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const rider = await Rider.findById(req.user.id).select('-password -__v');
      if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });
      return res.status(200).json({ success: true, rider });
    }

    const rider = inMemoryStore.riders.find((r) => r._id === req.user.id);
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    const safeRider = { ...rider };
    delete safeRider.password;
    res.status(200).json({ success: true, rider: safeRider });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update rider profile photo
 * @route   PUT /api/riders/profile
 * @access  Private (rider)
 */
const updateProfile = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const updateData = {};
      if (req.body.vehicleModel) updateData.vehicleModel = req.body.vehicleModel;
      if (req.file) updateData.profilePhoto = req.file.path;

      const rider = await Rider.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password -__v');
      return res.status(200).json({ success: true, rider });
    }

    const rider = inMemoryStore.riders.find((r) => r._id === req.user.id);
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    if (req.body.vehicleModel) rider.vehicleModel = req.body.vehicleModel;
    res.status(200).json({ success: true, rider });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update rider's current GPS location
 * @route   PUT /api/riders/location
 * @access  Private (rider)
 */
const updateLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat and lng are required' });
    }

    if (isDbConnected()) {
      await Rider.findByIdAndUpdate(req.user.id, {
        currentLocation: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        lastLocationUpdate: new Date(),
      });
      return res.status(200).json({ success: true, message: 'Location updated' });
    }

    const rider = inMemoryStore.riders.find((r) => r._id === req.user.id);
    if (rider) {
      rider.currentLocation = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };
      rider.lastLocationUpdate = new Date();
    }

    res.status(200).json({ success: true, message: 'Location updated' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Toggle rider online/offline availability
 * @route   PATCH /api/riders/availability
 * @access  Private (rider)
 */
const toggleAvailability = async (req, res, next) => {
  try {
    const { isOnline } = req.body;

    if (isDbConnected()) {
      const rider = await Rider.findById(req.user.id);
      if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

      if (!rider.isApproved) {
        return res.status(403).json({ success: false, message: 'You must be approved by admin before going online' });
      }

      rider.isOnline = typeof isOnline === 'boolean' ? isOnline : !rider.isOnline;
      await rider.save();

      return res.status(200).json({
        success: true,
        message: `You are now ${rider.isOnline ? 'online' : 'offline'}`,
        isOnline: rider.isOnline,
      });
    }

    const rider = inMemoryStore.riders.find((r) => r._id === req.user.id);
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    if (!rider.isApproved) {
      return res.status(403).json({ success: false, message: 'You must be approved by admin before going online' });
    }

    rider.isOnline = typeof isOnline === 'boolean' ? isOnline : !rider.isOnline;

    res.status(200).json({
      success: true,
      message: `You are now ${rider.isOnline ? 'online' : 'offline'}`,
      isOnline: rider.isOnline,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get rider earnings (daily / weekly / monthly)
 * @route   GET /api/riders/earnings?period=weekly
 * @access  Private (rider)
 */
const getEarnings = async (req, res, next) => {
  try {
    const { period = 'weekly' } = req.query;
    const riderId = req.user.id;

    if (isDbConnected()) {
      const now = new Date();
      let startDate = new Date();
      if (period === 'daily') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      else if (period === 'monthly') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      else {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
      }

      const payments = await Payment.aggregate([
        {
          $match: {
            riderId: require('mongoose').Types.ObjectId.createFromHexString(riderId),
            status: 'completed',
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            dailyEarnings: { $sum: '$riderEarnings' },
            totalRides: { $sum: 1 },
            totalCommission: { $sum: '$commission' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const totalEarnings = payments.reduce((acc, p) => acc + p.dailyEarnings, 0);
      const totalRides = payments.reduce((acc, p) => acc + p.totalRides, 0);

      return res.status(200).json({
        success: true,
        period,
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        todayEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalRides,
        breakdown: payments,
      });
    }

    // In-memory fallback
    const riderRides = inMemoryStore.rides.filter(
      (r) => r.riderId === riderId && r.status === 'completed'
    );
    const totalEarnings = riderRides.reduce((acc, r) => acc + (r.riderEarnings || (r.actualFare || r.estimatedFare) * 0.8), 0);
    const totalCommission = riderRides.reduce((acc, r) => acc + (r.commission || (r.actualFare || r.estimatedFare) * 0.2), 0);

    res.status(200).json({
      success: true,
      period,
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      todayEarnings: parseFloat(totalEarnings.toFixed(2)),
      totalCommission: parseFloat(totalCommission.toFixed(2)),
      netEarnings: parseFloat(totalEarnings.toFixed(2)),
      totalRides: riderRides.length,
      rideCount: riderRides.length,
      rides: riderRides,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get rider's ride history (paginated)
 * @route   GET /api/riders/rides?page=1&limit=10
 * @access  Private (rider)
 */
const getRideHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const [rides, total] = await Promise.all([
        Ride.find({ riderId: req.user.id })
          .populate('customerId', 'name phone profilePhoto')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('-__v'),
        Ride.countDocuments({ riderId: req.user.id }),
      ]);

      return res.status(200).json({
        success: true,
        rides,
        data: rides,
        pagination: { total, page, pages: Math.ceil(total / limit), limit },
      });
    }

    const filtered = inMemoryStore.rides.filter((r) => r.riderId === req.user.id);
    const paginated = filtered.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      rides: paginated,
      data: paginated,
      pagination: { total: filtered.length, page, pages: Math.ceil(filtered.length / limit) || 1, limit },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, updateLocation, toggleAvailability, getEarnings, getRideHistory };
