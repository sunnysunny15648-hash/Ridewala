const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', default: null },
    pickupAddress: { type: String, required: true },
    pickupLat: { type: Number, required: true },
    pickupLng: { type: Number, required: true },
    destinationAddress: { type: String, required: true },
    destinationLat: { type: Number, required: true },
    destinationLng: { type: Number, required: true },
    distance: { type: Number, required: true }, // in km
    duration: { type: Number }, // in minutes (estimated)
    estimatedFare: { type: Number, required: true },
    actualFare: { type: Number, default: null },
    baseFare: { type: Number },
    perKmCharge: { type: Number },
    status: {
      type: String,
      enum: ['searching', 'assigned', 'arriving', 'arrived', 'started', 'completed', 'cancelled'],
      default: 'searching',
    },
    paymentMethod: { type: String, enum: ['cash', 'online'], default: 'cash' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    cancelledBy: { type: String, enum: ['customer', 'rider', 'admin', null], default: null },
    cancellationReason: { type: String, default: '' },
  },
  { timestamps: true }
);

// Index for status queries
rideSchema.index({ status: 1, createdAt: -1 });
rideSchema.index({ customerId: 1, createdAt: -1 });
rideSchema.index({ riderId: 1, createdAt: -1 });

module.exports = mongoose.model('Ride', rideSchema);
