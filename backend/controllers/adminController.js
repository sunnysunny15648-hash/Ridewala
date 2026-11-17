const mongoose = require('mongoose');
const User = require('../models/User');
const Rider = require('../models/Rider');
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');
const PricingSettings = require('../models/PricingSettings');
const inMemoryStore = require('../services/inMemoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/dashboard
 * @access  Private (admin)
 */
const getDashboard = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const [
        totalCustomers,
        totalRiders,
        approvedRiders,
        pendingRiders,
        activeRides,
        completedRides,
        cancelledRides,
        revenueData,
      ] = await Promise.all([
        User.countDocuments({ role: 'customer', isActive: true }),
        Rider.countDocuments({ role: 'rider' }),
        Rider.countDocuments({ isApproved: true }),
        Rider.countDocuments({ isApproved: false, isActive: true }),
        Ride.countDocuments({ status: { $in: ['searching', 'assigned', 'arriving', 'arrived', 'started'] } }),
        Ride.countDocuments({ status: 'completed' }),
        Ride.countDocuments({ status: 'cancelled' }),
        Payment.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, totalRevenue: { $sum: '$amount' }, totalCommission: { $sum: '$commission' } } },
        ]),
      ]);

      const totalRevenue = revenueData[0]?.totalRevenue || 0;
      const totalCommission = revenueData[0]?.totalCommission || 0;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const dailyRevenue = await Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$amount' },
            rides: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          totalCustomers,
          totalRiders,
          approvedRiders,
          pendingRiders,
          activeRides,
          completedRides,
          cancelledRides,
          totalRevenue,
          totalCommission,
        },
        dailyRevenue,
      });
    }

    // In-memory fallback
    const totalCustomers = inMemoryStore.users.length;
    const totalRiders = inMemoryStore.riders.length;
    const approvedRiders = inMemoryStore.riders.filter((r) => r.isApproved).length;
    const pendingRiders = inMemoryStore.riders.filter((r) => !r.isApproved && r.isActive).length;
    const activeRides = inMemoryStore.rides.filter((r) =>
      ['searching', 'assigned', 'arriving', 'arrived', 'started'].includes(r.status)
    ).length;
    const completedRides = inMemoryStore.rides.filter((r) => r.status === 'completed').length;
    const cancelledRides = inMemoryStore.rides.filter((r) => r.status === 'cancelled').length;

    const completedList = inMemoryStore.rides.filter((r) => r.status === 'completed');
    const totalRevenue = completedList.reduce((acc, r) => acc + (r.actualFare || r.estimatedFare), 0);
    const totalCommission = completedList.reduce((acc, r) => acc + (r.commission || (r.actualFare || r.estimatedFare) * 0.2), 0);

    const dailyRevenue = [
      { _id: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], revenue: 48, rides: 1 },
      { _id: new Date(Date.now() - 86400000).toISOString().split('T')[0], revenue: 78, rides: 1 },
      { _id: new Date().toISOString().split('T')[0], revenue: Math.round(totalRevenue), rides: completedList.length },
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalRiders,
        approvedRiders,
        pendingRiders,
        activeRides,
        completedRides,
        cancelledRides,
        totalRevenue: Math.round(totalRevenue),
        totalCommission: Math.round(totalCommission),
      },
      dailyRevenue,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all customers
 * @route   GET /api/admin/customers
 * @access  Private (admin)
 */
const getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').toLowerCase();

    if (isDbConnected()) {
      const filter = { role: 'customer' };
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }

      const [customers, total] = await Promise.all([
        User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter),
      ]);

      return res.status(200).json({ success: true, customers, total, page, pages: Math.ceil(total / limit) });
    }

    let filtered = inMemoryStore.users;
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          (u.phone && u.phone.includes(search))
      );
    }

    const paginated = filtered.slice(skip, skip + limit).map((u) => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });

    res.status(200).json({
      success: true,
      customers: paginated,
      total: filtered.length,
      page,
      pages: Math.ceil(filtered.length / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Suspend or reactivate a customer
 * @route   PATCH /api/admin/customers/:id/status
 * @access  Private (admin)
 */
const updateCustomerStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (isDbConnected()) {
      const customer = await User.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true, select: '-password' }
      );
      if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
      return res.status(200).json({ success: true, customer });
    }

    const customer = inMemoryStore.users.find((u) => u._id === req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    customer.isActive = isActive;

    const safe = { ...customer };
    delete safe.password;
    res.status(200).json({ success: true, customer: safe });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all riders with optional filters
 * @route   GET /api/admin/riders
 * @access  Private (admin)
 */
const getRiders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').toLowerCase();
    const approvalStatus = req.query.approval;

    if (isDbConnected()) {
      const filter = { role: 'rider' };
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }
      if (approvalStatus === 'approved') filter.isApproved = true;
      if (approvalStatus === 'pending') { filter.isApproved = false; filter.isActive = true; }
      if (approvalStatus === 'suspended') filter.isActive = false;

      const [riders, total] = await Promise.all([
        Rider.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Rider.countDocuments(filter),
      ]);

      return res.status(200).json({ success: true, riders, total, page, pages: Math.ceil(total / limit) });
    }

    let filtered = inMemoryStore.riders;
    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(search) ||
          r.email.toLowerCase().includes(search) ||
          (r.phone && r.phone.includes(search))
      );
    }
    if (approvalStatus === 'approved') filtered = filtered.filter((r) => r.isApproved);
    if (approvalStatus === 'pending') filtered = filtered.filter((r) => !r.isApproved && r.isActive);
    if (approvalStatus === 'suspended') filtered = filtered.filter((r) => !r.isActive);

    const paginated = filtered.slice(skip, skip + limit).map((r) => {
      const copy = { ...r };
      delete copy.password;
      return copy;
    });

    res.status(200).json({
      success: true,
      riders: paginated,
      total: filtered.length,
      page,
      pages: Math.ceil(filtered.length / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Approve, reject, or suspend a rider
 * @route   PATCH /api/admin/riders/:id/approval
 * @access  Private (admin)
 */
const updateRiderApproval = async (req, res, next) => {
  try {
    const { action } = req.body;

    if (isDbConnected()) {
      const update = {};
      if (action === 'approve') { update.isApproved = true; update.isActive = true; }
      else if (action === 'reject') { update.isApproved = false; update.isActive = false; }
      else if (action === 'suspend') { update.isActive = false; }
      else if (action === 'activate') { update.isActive = true; }
      else return res.status(400).json({ success: false, message: 'Invalid action' });

      const rider = await Rider.findByIdAndUpdate(req.params.id, update, { new: true, select: '-password' });
      if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });
      return res.status(200).json({ success: true, message: `Rider ${action}d successfully`, rider });
    }

    const rider = inMemoryStore.riders.find((r) => r._id === req.params.id);
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    if (action === 'approve') { rider.isApproved = true; rider.isActive = true; }
    else if (action === 'reject') { rider.isApproved = false; rider.isActive = false; }
    else if (action === 'suspend') { rider.isActive = false; }
    else if (action === 'activate') { rider.isActive = true; }

    const safe = { ...rider };
    delete safe.password;
    res.status(200).json({ success: true, message: `Rider ${action}d successfully`, rider: safe });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all rides
 * @route   GET /api/admin/rides
 * @access  Private (admin)
 */
const getAllRides = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    if (isDbConnected()) {
      const filter = {};
      if (status) filter.status = status;

      const [rides, total] = await Promise.all([
        Ride.find(filter)
          .populate('customerId', 'name phone email')
          .populate('riderId', 'name phone rating')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Ride.countDocuments(filter),
      ]);

      return res.status(200).json({ success: true, rides, total, page, pages: Math.ceil(total / limit) });
    }

    let filtered = inMemoryStore.rides;
    if (status) filtered = filtered.filter((r) => r.status === status);

    const paginated = filtered.slice(skip, skip + limit).map((r) => {
      const customer = inMemoryStore.users.find((u) => u._id === r.customerId) || { name: r.customerName || 'Customer', phone: '9876543210' };
      const rider = r.riderId ? inMemoryStore.riders.find((rd) => rd._id === r.riderId) : null;
      return {
        ...r,
        customerId: customer,
        riderId: rider ? { name: rider.name, phone: rider.phone, rating: rider.rating } : null,
      };
    });

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
 * @desc    Get current pricing
 * @route   GET /api/admin/pricing
 * @access  Private (admin)
 */
const getPricing = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      let pricing = await PricingSettings.findOne({ isActive: true });
      if (!pricing) pricing = await PricingSettings.create({});
      return res.status(200).json({ success: true, pricing });
    }

    res.status(200).json({ success: true, pricing: inMemoryStore.pricing });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update pricing settings
 * @route   PUT /api/admin/pricing
 * @access  Private (admin)
 */
const updatePricing = async (req, res, next) => {
  try {
    const { baseFare, perKmCharge, minimumFare, waitingChargePerMin, commissionPercent } = req.body;

    if (isDbConnected()) {
      const pricing = await PricingSettings.findOneAndUpdate(
        { isActive: true },
        { $set: { baseFare, perKmCharge, minimumFare, waitingChargePerMin, commissionPercent } },
        { new: true, upsert: true }
      );
      return res.status(200).json({ success: true, pricing });
    }

    inMemoryStore.pricing = {
      baseFare: parseFloat(baseFare) || 20,
      perKmCharge: parseFloat(perKmCharge) || 8,
      minimumFare: parseFloat(minimumFare) || 30,
      waitingChargePerMin: parseFloat(waitingChargePerMin) || 2,
      commissionPercent: parseFloat(commissionPercent) || 20,
      isActive: true,
    };

    res.status(200).json({ success: true, pricing: inMemoryStore.pricing });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get revenue reports
 * @route   GET /api/admin/reports
 * @access  Private (admin)
 */
const getReports = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      const [revenueData, ridesData] = await Promise.all([
        Payment.aggregate([
          { $match: { status: 'completed', createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              revenue: { $sum: '$amount' },
              commission: { $sum: '$commission' },
              riderEarnings: { $sum: '$riderEarnings' },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Ride.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              total: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
              cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

      return res.status(200).json({ success: true, revenueData, ridesData });
    }

    // In-memory reports
    const revenueData = [
      { _id: '2024-11-08', revenue: 140, commission: 28, count: 2 },
      { _id: '2024-11-09', revenue: 220, commission: 44, count: 3 },
      { _id: '2024-11-10', revenue: 310, commission: 62, count: 4 },
      { _id: '2024-11-11', revenue: 450, commission: 90, count: 6 },
    ];
    const ridesData = [
      { _id: '2024-11-08', completed: 2, cancelled: 0 },
      { _id: '2024-11-09', completed: 3, cancelled: 1 },
      { _id: '2024-11-10', completed: 4, cancelled: 0 },
      { _id: '2024-11-11', completed: 6, cancelled: 1 },
    ];

    res.status(200).json({ success: true, revenueData, ridesData });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Export report as CSV
 * @route   GET /api/admin/reports/export
 * @access  Private (admin)
 */
const exportCSV = async (req, res, next) => {
  try {
    const list = isDbConnected()
      ? await Ride.find({ status: 'completed' }).populate('customerId', 'name email').populate('riderId', 'name')
      : inMemoryStore.rides.filter((r) => r.status === 'completed');

    const headers = ['Ride ID', 'Customer', 'Rider', 'Distance (km)', 'Fare (INR)', 'Payment', 'Status', 'Date'];
    const rows = list.map((r) => [
      r._id,
      r.customerId?.name || r.customerName || 'Customer',
      r.riderId?.name || r.riderName || 'Rider',
      r.distance,
      r.actualFare || r.estimatedFare,
      r.paymentMethod,
      r.status,
      new Date(r.createdAt).toISOString().split('T')[0],
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((v) => `"${v}"`).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ridewala-report.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getCustomers,
  updateCustomerStatus,
  getRiders,
  updateRiderApproval,
  getAllRides,
  updatePricing,
  getPricing,
  getReports,
  exportCSV,
};
