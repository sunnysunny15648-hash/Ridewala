const mongoose = require('mongoose');

const pricingSettingsSchema = new mongoose.Schema({
  baseFare: { type: Number, default: 20 },
  perKmCharge: { type: Number, default: 8 },
  minimumFare: { type: Number, default: 30 },
  waitingChargePerMin: { type: Number, default: 2 },
  commissionPercent: { type: Number, default: 20 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PricingSettings', pricingSettingsSchema);
