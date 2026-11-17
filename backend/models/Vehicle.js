const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', required: true },
  regNumber: { type: String, required: true, unique: true, trim: true },
  model: { type: String, required: true, trim: true },
  type: { type: String, enum: ['bike', 'scooter', 'electric'], default: 'bike' },
  color: { type: String, trim: true },
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
