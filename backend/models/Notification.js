const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ['customer', 'rider', 'admin'], required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['ride_request', 'ride_accepted', 'ride_started', 'ride_completed', 'ride_cancelled', 'payment', 'general'],
    default: 'general',
  },
  isRead: { type: Boolean, default: false },
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', default: null },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
