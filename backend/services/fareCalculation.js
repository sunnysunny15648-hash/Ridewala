const mongoose = require('mongoose');
const PricingSettings = require('../models/PricingSettings');
const inMemoryStore = require('./inMemoryStore');

/**
 * Calculate ride fare based on distance and active pricing settings.
 * Falls back to in-memory settings or defaults if DB is not connected.
 */
const calculateFare = async (distanceKm) => {
  let settings;

  if (mongoose.connection.readyState === 1) {
    try {
      settings = await PricingSettings.findOne({ isActive: true });
    } catch {
      settings = null;
    }
  }

  if (!settings) {
    settings = inMemoryStore.pricing || {
      baseFare: 20,
      perKmCharge: 8,
      minimumFare: 30,
      commissionPercent: 20,
    };
  }

  const distanceCharge = distanceKm * settings.perKmCharge;
  const totalFare = Math.max(settings.baseFare + distanceCharge, settings.minimumFare);
  const commission = (totalFare * settings.commissionPercent) / 100;
  const riderEarnings = totalFare - commission;

  return {
    baseFare: settings.baseFare,
    perKmCharge: settings.perKmCharge,
    distanceCharge: parseFloat(distanceCharge.toFixed(2)),
    totalFare: parseFloat(totalFare.toFixed(2)),
    commission: parseFloat(commission.toFixed(2)),
    riderEarnings: parseFloat(riderEarnings.toFixed(2)),
    commissionPercent: settings.commissionPercent,
  };
};

module.exports = { calculateFare };
