const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Rider = require('../models/Rider');
const Admin = require('../models/Admin');
const { generateToken } = require('../utils/helpers');
const inMemoryStore = require('../services/inMemoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * @desc    Register a new customer
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerCustomer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, password } = req.body;

    if (isDbConnected()) {
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.email === email ? 'Email already registered' : 'Phone already registered',
        });
      }

      const user = await User.create({ name, email, phone, password });
      const token = generateToken({ id: user._id, role: 'customer' });

      return res.status(201).json({
        success: true,
        message: 'Customer registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    // In-memory fallback
    const existing = inMemoryStore.users.find((u) => u.email === email || u.phone === phone);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: existing.email === email ? 'Email already registered' : 'Phone already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: inMemoryStore.generateId(),
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'customer',
      isActive: true,
      savedAddresses: [],
      createdAt: new Date(),
    };
    inMemoryStore.users.push(newUser);

    const token = generateToken({ id: newUser._id, role: 'customer' });
    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login for all user types (customer, rider, admin)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    if (isDbConnected()) {
      let account = await User.findOne({ email }).select('+password');
      let role = 'customer';

      if (!account) {
        account = await Rider.findOne({ email }).select('+password');
        role = 'rider';
      }

      if (!account) {
        account = await Admin.findOne({ email }).select('+password');
        role = 'admin';
      }

      if (!account) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await account.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      if (account.isActive === false) {
        return res.status(403).json({ success: false, message: 'Your account has been suspended' });
      }

      const token = generateToken({ id: account._id, role });
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: account._id,
          name: account.name,
          email: account.email,
          phone: account.phone || undefined,
          role,
          ...(role === 'rider' && { isApproved: account.isApproved }),
        },
      });
    }

    // In-memory fallback
    let account = inMemoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    let role = 'customer';

    if (!account) {
      account = inMemoryStore.riders.find((r) => r.email.toLowerCase() === email.toLowerCase());
      role = 'rider';
    }

    if (!account) {
      account = inMemoryStore.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
      role = 'admin';
    }

    if (!account) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (account.isActive === false) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    const token = generateToken({ id: account._id, role });
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: account._id,
        name: account.name,
        email: account.email,
        phone: account.phone,
        role,
        ...(role === 'rider' && { isApproved: account.isApproved }),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const { id, role } = req.user;

    if (isDbConnected()) {
      let user;
      if (role === 'customer') user = await User.findById(id).select('-password');
      else if (role === 'rider') user = await Rider.findById(id).select('-password');
      else if (role === 'admin') user = await Admin.findById(id).select('-password');

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(200).json({ success: true, user });
    }

    // In-memory fallback
    let user;
    if (role === 'customer') user = inMemoryStore.users.find((u) => u._id === id);
    else if (role === 'rider') user = inMemoryStore.riders.find((r) => r._id === id);
    else if (role === 'admin') user = inMemoryStore.admins.find((a) => a._id === id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const safeUser = { ...user };
    delete safeUser.password;
    res.status(200).json({ success: true, user: safeUser });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Register a new rider
 * @route   POST /api/auth/register-rider
 * @access  Public
 */
const registerRider = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, password, licenceNumber, vehicleRegNumber, vehicleModel } = req.body;

    if (isDbConnected()) {
      const existingRider = await Rider.findOne({ $or: [{ email }, { phone }, { licenceNumber }] });
      if (existingRider) {
        return res.status(400).json({
          success: false,
          message: 'A rider with this email, phone, or licence number already exists',
        });
      }

      const rider = await Rider.create({
        name,
        email,
        phone,
        password,
        licenceNumber,
        vehicleRegNumber,
        vehicleModel,
        isApproved: false,
      });

      return res.status(201).json({
        success: true,
        message: 'Rider registered successfully. Awaiting admin approval.',
        rider: {
          id: rider._id,
          name: rider.name,
          email: rider.email,
          phone: rider.phone,
          isApproved: rider.isApproved,
        },
      });
    }

    // In-memory fallback
    const existing = inMemoryStore.riders.find(
      (r) => r.email === email || r.phone === phone || r.licenceNumber === licenceNumber
    );
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A rider with this email, phone, or licence number already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newRider = {
      _id: inMemoryStore.generateId(),
      name,
      email,
      phone,
      password: hashedPassword,
      licenceNumber,
      vehicleRegNumber,
      vehicleModel,
      role: 'rider',
      isApproved: false,
      isOnline: false,
      rating: 5.0,
      totalRides: 0,
      isActive: true,
      createdAt: new Date(),
    };
    inMemoryStore.riders.push(newRider);

    res.status(201).json({
      success: true,
      message: 'Rider registered successfully. Awaiting admin approval.',
      rider: {
        id: newRider._id,
        name: newRider.name,
        email: newRider.email,
        phone: newRider.phone,
        isApproved: newRider.isApproved,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerCustomer, loginUser, getMe, registerRider };
