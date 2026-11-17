const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const riderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    profilePhoto: { type: String, default: '' },
    licenceNumber: { type: String, required: true, unique: true },
    licenceImage: { type: String, default: '' },
    vehicleRegNumber: { type: String, required: true, unique: true },
    vehicleModel: { type: String, default: '' },
    vehicleImage: { type: String, default: '' },
    documents: [
      {
        name: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isApproved: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    totalRides: { type: Number, default: 0 },
    role: { type: String, enum: ['rider'], default: 'rider' },
    isActive: { type: Boolean, default: true },
    lastLocationUpdate: { type: Date },
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
riderSchema.index({ currentLocation: '2dsphere' });

// Hash password before save
riderSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compare a plain-text password to the stored hash.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
riderSchema.methods.matchPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Rider', riderSchema);
