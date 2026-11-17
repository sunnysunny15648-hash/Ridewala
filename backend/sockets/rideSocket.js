const { getIO } = require('./index');

const safeEmit = (fn) => {
  try {
    const io = getIO();
    if (io) fn(io);
  } catch (err) {
    console.warn('Socket emit ignored:', err.message);
  }
};

/**
 * Notify multiple riders of a new ride request.
 * Each rider gets the event in their personal room.
 *
 * @param {string[]} riderIds - Array of rider ObjectId strings.
 * @param {Object} rideData - Ride details to send.
 */
const notifyRiders = (riderIds, rideData) => {
  safeEmit((io) => {
    riderIds.forEach((riderId) => {
      io.to(`rider-${riderId}`).emit('new-ride-request', rideData);
    });
  });
};

/**
 * Send an event to a specific customer's room.
 *
 * @param {string} customerId - Customer ObjectId string.
 * @param {string} event - Socket event name.
 * @param {Object} data - Payload to emit.
 */
const notifyCustomer = (customerId, event, data) => {
  safeEmit((io) => {
    io.to(`customer-${customerId}`).emit(event, data);
  });
};

/**
 * Notify a specific rider with an event.
 *
 * @param {string} riderId - Rider ObjectId string.
 * @param {string} event - Socket event name.
 * @param {Object} data - Payload to emit.
 */
const notifyRider = (riderId, event, data) => {
  safeEmit((io) => {
    io.to(`rider-${riderId}`).emit(event, data);
  });
};

/**
 * Update a rider's location and broadcast to admin/customer rooms.
 *
 * @param {string} riderId - Rider ObjectId string.
 * @param {{ lat: number, lng: number }} location - New location.
 * @param {string} [customerId] - Optional customer watching this ride.
 */
const updateRiderLocation = (riderId, location, customerId) => {
  safeEmit((io) => {
    // Notify admin dashboard
    io.to('admin').emit('rider-location-update', { riderId, ...location });
    // Notify the customer tracking this ride
    if (customerId) {
      io.to(`customer-${customerId}`).emit('rider-location-update', { riderId, ...location });
    }
  });
};

/**
 * Broadcast an event to the admin room.
 *
 * @param {string} event - Socket event name.
 * @param {Object} data - Payload to emit.
 */
const notifyAdmin = (event, data) => {
  safeEmit((io) => {
    io.to('admin').emit(event, data);
  });
};

module.exports = { notifyRiders, notifyCustomer, notifyRider, updateRiderLocation, notifyAdmin };
