const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

/**
 * Initialize Socket.IO on the HTTP server.
 * Sets up JWT auth middleware and room-joining logic.
 *
 * @param {import('http').Server} server - Node HTTP server instance.
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow connections from all portals (Customer 5173, Rider 5174, Admin 5175)
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // JWT authentication middleware for socket handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const secret = process.env.JWT_SECRET || 'ridewala_super_secret_jwt_key_change_this_in_production_2024';
      const decoded = jwt.verify(token, secret);
      socket.user = { id: decoded.id, role: decoded.role };
      next();
    } catch {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.user;
    console.log(`Socket connected: ${role} ${id} (${socket.id})`);

    // Each user joins their personal room for targeted notifications
    if (role === 'customer') {
      socket.join(`customer-${id}`);
    } else if (role === 'rider') {
      socket.join(`rider-${id}`);
    } else if (role === 'admin') {
      socket.join('admin');
    }

    // Rider location update from client
    socket.on('update-location', ({ lat, lng }) => {
      if (role === 'rider') {
        // Broadcast to admin room for live tracking
        io.to('admin').emit('rider-location-update', { riderId: id, lat, lng });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${role} ${id} - ${reason}`);
    });
  });

  return io;
};

/**
 * Get the initialized Socket.IO instance.
 * @returns {import('socket.io').Server}
 */
const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized. Call initSocket(server) first.');
  return io;
};

module.exports = { initSocket, getIO };
