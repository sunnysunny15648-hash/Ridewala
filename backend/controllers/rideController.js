const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const Rider = require('../models/Rider');
const Payment = require('../models/Payment');
const { calculateFare } = require('../services/fareCalculation');
const { findNearbyRiders } = require('../services/rideMatching');
const { notifyRiders, notifyCustomer } = require('../sockets/rideSocket');
const inMemoryStore = require('../services/inMemoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * @desc    Book a new ride
 * @route   POST /api/rides/book
 * @access  Private (customer)
 */
const bookRide = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      pickupAddress, pickupLat, pickupLng,
      destinationAddress, destinationLat, destinationLng,
      distance, duration, paymentMethod,
    } = req.body;

    const parsedDistance = parseFloat(distance) || 3.0;
    const parsedDuration = duration ? parseInt(duration, 10) : Math.ceil((parsedDistance / 25) * 60);
    const fareBreakdown = await calculateFare(parsedDistance);

    if (isDbConnected()) {
      const ride = await Ride.create({
        customerId: req.user.id,
        pickupAddress,
        pickupLat: parseFloat(pickupLat),
        pickupLng: parseFloat(pickupLng),
        destinationAddress,
        destinationLat: parseFloat(destinationLat),
        destinationLng: parseFloat(destinationLng),
        distance: parsedDistance,
        duration: parsedDuration,
        estimatedFare: fareBreakdown.totalFare,
        baseFare: fareBreakdown.baseFare,
        perKmCharge: fareBreakdown.perKmCharge,
        status: 'searching',
        paymentMethod: paymentMethod || 'cash',
      });

      const nearbyRiders = await findNearbyRiders(parseFloat(pickupLat), parseFloat(pickupLng));
      const riderIds = nearbyRiders.map((r) => r._id.toString());

      if (riderIds.length > 0) {
        notifyRiders(riderIds, {
          rideId: ride._id,
          pickup: { address: pickupAddress, lat: pickupLat, lng: pickupLng },
          destination: { address: destinationAddress, lat: destinationLat, lng: destinationLng },
          distance: parsedDistance,
          estimatedFare: fareBreakdown.totalFare,
          fareBreakdown,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Ride booked successfully. Searching for nearby riders...',
        ride: {
          id: ride._id,
          status: ride.status,
          pickup: { address: pickupAddress, lat: pickupLat, lng: pickupLng },
          destination: { address: destinationAddress, lat: destinationLat, lng: destinationLng },
          distance: parsedDistance,
          fareBreakdown,
          paymentMethod: ride.paymentMethod,
        },
        nearbyRidersFound: riderIds.length,
      });
    }

    // In-memory fallback
    const newRide = {
      _id: inMemoryStore.generateId(),
      customerId: req.user.id,
      customerName: inMemoryStore.users.find((u) => u._id === req.user.id)?.name || 'Rahul Sharma',
      riderId: null,
      pickupAddress,
      pickupLat: parseFloat(pickupLat),
      pickupLng: parseFloat(pickupLng),
      destinationAddress,
      destinationLat: parseFloat(destinationLat),
      destinationLng: parseFloat(destinationLng),
      distance: parsedDistance,
      duration: parsedDuration,
      estimatedFare: fareBreakdown.totalFare,
      baseFare: fareBreakdown.baseFare,
      perKmCharge: fareBreakdown.perKmCharge,
      status: 'searching',
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'pending',
      createdAt: new Date(),
    };
    inMemoryStore.rides.unshift(newRide);

    const nearbyRiders = await findNearbyRiders(parseFloat(pickupLat), parseFloat(pickupLng));
    const riderIds = nearbyRiders.map((r) => r._id.toString());

    if (riderIds.length > 0) {
      notifyRiders(riderIds, {
        rideId: newRide._id,
        pickup: { address: pickupAddress, lat: pickupLat, lng: pickupLng },
        destination: { address: destinationAddress, lat: destinationLat, lng: destinationLng },
        distance: parsedDistance,
        estimatedFare: fareBreakdown.totalFare,
        fareBreakdown,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Ride booked successfully. Searching for nearby riders...',
      ride: {
        id: newRide._id,
        status: newRide.status,
        pickup: { address: pickupAddress, lat: pickupLat, lng: pickupLng },
        destination: { address: destinationAddress, lat: destinationLat, lng: destinationLng },
        distance: parsedDistance,
        fareBreakdown,
        paymentMethod: newRide.paymentMethod,
      },
      nearbyRidersFound: riderIds.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single ride by ID
 * @route   GET /api/rides/:id
 * @access  Private
 */
const getRide = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const ride = await Ride.findById(req.params.id)
        .populate('customerId', 'name phone profilePhoto')
        .populate('riderId', 'name phone profilePhoto rating vehicleModel vehicleRegNumber');

      if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
      return res.status(200).json({ success: true, ride });
    }

    // In-memory fallback
    const ride = inMemoryStore.rides.find((r) => r._id === req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    const customer = inMemoryStore.users.find((u) => u._id === ride.customerId) || { name: ride.customerName || 'Customer', phone: '9876543210' };
    const rider = ride.riderId ? inMemoryStore.riders.find((r) => r._id === ride.riderId) : null;

    res.status(200).json({
      success: true,
      ride: {
        ...ride,
        customerId: customer,
        riderId: rider ? {
          _id: rider._id,
          name: rider.name,
          phone: rider.phone,
          rating: rider.rating || 4.9,
          vehicleModel: rider.vehicleModel,
          vehicleRegNumber: rider.vehicleRegNumber,
        } : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get ride history for the authenticated user
 * @route   GET /api/rides/history
 * @access  Private
 */
const getRideHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const filter = req.user.role === 'customer'
        ? { customerId: req.user.id }
        : { riderId: req.user.id };

      const [rides, total] = await Promise.all([
        Ride.find(filter)
          .populate('customerId', 'name phone')
          .populate('riderId', 'name phone rating')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Ride.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,
        rides,
        total,
        page,
        pages: Math.ceil(total / limit),
      });
    }

    // In-memory fallback
    const filterFn = req.user.role === 'customer'
      ? (r) => r.customerId === req.user.id
      : (r) => r.riderId === req.user.id;

    const filtered = inMemoryStore.rides.filter(filterFn);
    const paginated = filtered.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      rides: paginated,
      total: filtered.length,
      page,
      pages: Math.ceil(filtered.length / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Accept a ride request (rider only)
 * @route   POST /api/rides/:id/accept
 * @access  Private (rider)
 */
const acceptRide = async (req, res, next) => {
  try {
    const riderId = req.user.id;
    const rideId = req.params.id;

    if (isDbConnected()) {
      const ride = await Ride.findOneAndUpdate(
        { _id: rideId, status: 'searching' },
        { $set: { riderId, status: 'assigned' } },
        { new: true }
      ).populate('customerId', 'name phone');

      if (!ride) {
        return res.status(409).json({ success: false, message: 'Ride is no longer available' });
      }

      notifyCustomer(ride.customerId._id.toString(), 'ride-accepted', {
        rideId: ride._id,
        riderId,
        status: 'assigned',
      });

      return res.status(200).json({ success: true, message: 'Ride accepted', ride });
    }

    // In-memory fallback
    const ride = inMemoryStore.rides.find((r) => r._id === rideId && r.status === 'searching');
    if (!ride) {
      return res.status(409).json({ success: false, message: 'Ride is no longer available' });
    }

    ride.riderId = riderId;
    ride.status = 'assigned';

    notifyCustomer(ride.customerId, 'ride-accepted', {
      rideId: ride._id,
      riderId,
      status: 'assigned',
    });

    res.status(200).json({ success: true, message: 'Ride accepted', ride });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update ride status (arriving → arrived → started → completed)
 * @route   PATCH /api/rides/:id/status
 * @access  Private (rider)
 */
const updateRideStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'status is required' });

    if (isDbConnected()) {
      const ride = await Ride.findById(req.params.id);
      if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

      ride.status = status;
      if (status === 'completed') {
        ride.actualFare = ride.estimatedFare;
        ride.paymentStatus = ride.paymentMethod === 'cash' ? 'completed' : 'pending';
        const fareBreakdown = await calculateFare(ride.distance);

        await Payment.create({
          rideId: ride._id,
          customerId: ride.customerId,
          riderId: ride.riderId,
          amount: ride.actualFare,
          method: ride.paymentMethod,
          status: ride.paymentMethod === 'cash' ? 'completed' : 'pending',
          commission: fareBreakdown.commission,
          riderEarnings: fareBreakdown.riderEarnings,
        });

        await Rider.findByIdAndUpdate(ride.riderId, { $inc: { totalRides: 1 } });
      }

      await ride.save();
      notifyCustomer(ride.customerId.toString(), 'ride-status-update', { rideId: ride._id, status });
      return res.status(200).json({ success: true, message: `Ride status updated to ${status}`, ride });
    }

    // In-memory fallback
    const ride = inMemoryStore.rides.find((r) => r._id === req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    ride.status = status;
    if (status === 'completed') {
      ride.actualFare = ride.estimatedFare;
      ride.paymentStatus = ride.paymentMethod === 'cash' ? 'completed' : 'pending';
      const fareBreakdown = await calculateFare(ride.distance);
      ride.riderEarnings = fareBreakdown.riderEarnings;
      ride.commission = fareBreakdown.commission;

      const rider = inMemoryStore.riders.find((r) => r._id === ride.riderId);
      if (rider) rider.totalRides = (rider.totalRides || 0) + 1;
    }

    notifyCustomer(ride.customerId, 'ride-status-update', { rideId: ride._id, status });
    res.status(200).json({ success: true, message: `Ride status updated to ${status}`, ride });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Cancel a ride
 * @route   POST /api/rides/:id/cancel
 * @access  Private (customer or rider)
 */
const cancelRide = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;

    if (isDbConnected()) {
      const ride = await Ride.findById(req.params.id);
      if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

      ride.status = 'cancelled';
      ride.cancelledBy = req.user.role;
      ride.cancellationReason = cancellationReason || '';
      await ride.save();

      if (ride.customerId) {
        notifyCustomer(ride.customerId.toString(), 'ride-cancelled', { rideId: ride._id, status: 'cancelled' });
      }
      if (ride.riderId) {
        notifyRiders([ride.riderId.toString()], { rideId: ride._id, status: 'cancelled' });
      }

      return res.status(200).json({ success: true, message: 'Ride cancelled', ride });
    }

    // In-memory fallback
    const ride = inMemoryStore.rides.find((r) => r._id === req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    ride.status = 'cancelled';
    ride.cancelledBy = req.user.role;
    ride.cancellationReason = cancellationReason || '';

    if (ride.customerId) {
      notifyCustomer(ride.customerId.toString(), 'ride-cancelled', { rideId: ride._id, status: 'cancelled' });
    }
    if (ride.riderId) {
      notifyRiders([ride.riderId.toString()], { rideId: ride._id, status: 'cancelled' });
    }

    res.status(200).json({ success: true, message: 'Ride cancelled', ride });
  } catch (err) {
    next(err);
  }
};

module.exports = { bookRide, getRide, getRideHistory, acceptRide, updateRideStatus, cancelRide };
