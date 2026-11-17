const mongoose = require('mongoose');
const User = require('../models/User');
const Ride = require('../models/Ride');
const inMemoryStore = require('../services/inMemoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * @desc    Get customer profile
 * @route   GET /api/customers/profile
 * @access  Private (customer)
 */
const getProfile = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.user.id).select('-__v -password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(200).json({ success: true, user });
    }

    const user = inMemoryStore.users.find((u) => u._id === req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const safeUser = { ...user };
    delete safeUser.password;
    res.status(200).json({ success: true, user: safeUser });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update customer profile
 * @route   PUT /api/customers/profile
 * @access  Private (customer)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (isDbConnected()) {
      const updateData = {};
      if (name) updateData.name = name.trim();
      if (phone) updateData.phone = phone.trim();
      if (req.file) updateData.profilePhoto = req.file.path;

      const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true }).select('-__v -password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(200).json({ success: true, message: 'Profile updated', user });
    }

    const user = inMemoryStore.users.find((u) => u._id === req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();

    const safeUser = { ...user };
    delete safeUser.password;
    res.status(200).json({ success: true, message: 'Profile updated', user: safeUser });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get customer's ride history (paginated)
 * @route   GET /api/customers/rides?page=1&limit=10
 * @access  Private (customer)
 */
const getRideHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const [rides, total] = await Promise.all([
        Ride.find({ customerId: req.user.id })
          .populate('riderId', 'name phone profilePhoto rating')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('-__v'),
        Ride.countDocuments({ customerId: req.user.id }),
      ]);

      return res.status(200).json({
        success: true,
        rides,
        data: rides,
        pagination: { total, page, pages: Math.ceil(total / limit), limit },
      });
    }

    const filtered = inMemoryStore.rides.filter((r) => r.customerId === req.user.id);
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

/**
 * @desc    Get customer's saved addresses
 * @route   GET /api/customers/addresses
 * @access  Private (customer)
 */
const getSavedAddresses = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.user.id).select('savedAddresses');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(200).json({ success: true, addresses: user.savedAddresses });
    }

    const user = inMemoryStore.users.find((u) => u._id === req.user.id);
    res.status(200).json({ success: true, addresses: user?.savedAddresses || [] });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add a saved address
 * @route   POST /api/customers/addresses
 * @access  Private (customer)
 */
const addSavedAddress = async (req, res, next) => {
  try {
    const { label, address, coords } = req.body;
    if (!label || !address) {
      return res.status(400).json({ success: false, message: 'label and address are required' });
    }

    if (isDbConnected()) {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $push: { savedAddresses: { label, address, coords } } },
        { new: true }
      ).select('savedAddresses');
      return res.status(201).json({ success: true, message: 'Address saved', addresses: user.savedAddresses });
    }

    const user = inMemoryStore.users.find((u) => u._id === req.user.id);
    if (!user.savedAddresses) user.savedAddresses = [];
    user.savedAddresses.push({ _id: inMemoryStore.generateId(), label, address, coords });

    res.status(201).json({ success: true, message: 'Address saved', addresses: user.savedAddresses });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, getRideHistory, getSavedAddresses, addSavedAddress };
