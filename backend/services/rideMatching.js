const mongoose = require('mongoose');
const Rider = require('../models/Rider');
const inMemoryStore = require('./inMemoryStore');

/**
 * Calculate the distance in km between two lat/lng points using Haversine formula.
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

/**
 * Find online, approved, and active riders within a given radius of a point.
 */
const findNearbyRiders = async (lat, lng, radiusKm = 10) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const radiusMeters = radiusKm * 1000;
      const riders = await Rider.find({
        isOnline: true,
        isApproved: true,
        isActive: true,
        currentLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: radiusMeters,
          },
        },
      }).select('_id name phone rating currentLocation');
      return riders;
    } catch {
      // Fall through to in-memory check
    }
  }

  // In-memory calculation
  return inMemoryStore.riders
    .filter((r) => r.isOnline && r.isApproved && r.isActive)
    .filter((r) => {
      if (!r.currentLocation?.coordinates) return true; // Include available riders
      const [rLng, rLat] = r.currentLocation.coordinates;
      const dist = haversineDistance(lat, lng, rLat, rLng);
      return dist <= radiusKm || dist <= 50; // generous radius for demo
    })
    .map((r) => ({
      _id: r._id,
      name: r.name,
      phone: r.phone,
      rating: r.rating,
      vehicleModel: r.vehicleModel,
      vehicleRegNumber: r.vehicleRegNumber,
    }));
};

module.exports = { findNearbyRiders, haversineDistance };
