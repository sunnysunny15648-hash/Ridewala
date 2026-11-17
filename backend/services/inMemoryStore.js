const bcrypt = require('bcryptjs');

// Pre-hashed passwords for instant login
// Password for Demo@123: $2a$12$eA.Xh.Y4r3Q3kEaHqF5vteK2s2L3d5J8l0m9n8b7v6c5x4z3a2s1d (or hash dynamically once on module load)
const SALT_ROUNDS = 10;
const DEMO_PASSWORD_HASH = bcrypt.hashSync('Demo@123', SALT_ROUNDS);
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('Admin@12345', SALT_ROUNDS);

const inMemoryStore = {
  users: [
    {
      _id: '6731a1b2c3d4e5f600000001',
      name: 'Rahul Sharma',
      email: 'customer@demo.com',
      phone: '9876543210',
      password: DEMO_PASSWORD_HASH,
      role: 'customer',
      isActive: true,
      savedAddresses: [
        { label: 'Home', address: 'Connaught Place, New Delhi', coords: { lat: 28.6315, lng: 77.2167 } },
        { label: 'Office', address: 'Cyber City, Gurugram', coords: { lat: 28.4952, lng: 77.0895 } },
      ],
      createdAt: new Date('2024-01-15'),
    },
  ],

  riders: [
    {
      _id: '6731a1b2c3d4e5f600000002',
      name: 'Amit Kumar',
      email: 'captain@demo.com',
      phone: '9876543211',
      password: DEMO_PASSWORD_HASH,
      licenceNumber: 'DL1420110012345',
      vehicleRegNumber: 'DL01AB1234',
      vehicleModel: 'Honda Activa 6G',
      role: 'rider',
      isApproved: true,
      isOnline: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.209, 28.6139], // [lng, lat]
      },
      rating: 4.9,
      totalRides: 48,
      isActive: true,
      createdAt: new Date('2024-01-10'),
    },
    {
      _id: '6731a1b2c3d4e5f600000003',
      name: 'Vikram Singh',
      email: 'vikram@ridewala.in',
      phone: '9876543212',
      password: DEMO_PASSWORD_HASH,
      licenceNumber: 'MH0220190054321',
      vehicleRegNumber: 'MH02CD5678',
      vehicleModel: 'Bajaj Pulsar 150',
      role: 'rider',
      isApproved: true,
      isOnline: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.215, 28.62], // nearby
      },
      rating: 4.8,
      totalRides: 32,
      isActive: true,
      createdAt: new Date('2024-02-01'),
    },
    {
      _id: '6731a1b2c3d4e5f600000004',
      name: 'Suresh Patel',
      email: 'suresh@pending.com',
      phone: '9876543213',
      password: DEMO_PASSWORD_HASH,
      licenceNumber: 'GJ0120220098765',
      vehicleRegNumber: 'GJ01EF9012',
      vehicleModel: 'TVS Jupiter',
      role: 'rider',
      isApproved: false,
      isOnline: false,
      rating: 5.0,
      totalRides: 0,
      isActive: true,
      createdAt: new Date(),
    },
  ],

  admins: [
    {
      _id: '6731a1b2c3d4e5f600000000',
      name: 'RideWala Admin',
      email: 'admin@ridewala.in',
      password: ADMIN_PASSWORD_HASH,
      role: 'admin',
      createdAt: new Date('2024-01-01'),
    },
  ],

  rides: [
    {
      _id: '6731a1b2c3d4e5f600000010',
      customerId: '6731a1b2c3d4e5f600000001',
      customerName: 'Rahul Sharma',
      riderId: '6731a1b2c3d4e5f600000002',
      riderName: 'Amit Kumar',
      pickupAddress: 'Connaught Place, New Delhi',
      pickupLat: 28.6315,
      pickupLng: 77.2167,
      destinationAddress: 'India Gate, New Delhi',
      destinationLat: 28.6129,
      destinationLng: 77.2295,
      distance: 3.5,
      duration: 12,
      estimatedFare: 48,
      actualFare: 48,
      baseFare: 20,
      perKmCharge: 8,
      status: 'completed',
      paymentMethod: 'cash',
      paymentStatus: 'completed',
      riderEarnings: 38.4,
      commission: 9.6,
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      _id: '6731a1b2c3d4e5f600000011',
      customerId: '6731a1b2c3d4e5f600000001',
      customerName: 'Rahul Sharma',
      riderId: '6731a1b2c3d4e5f600000002',
      riderName: 'Amit Kumar',
      pickupAddress: 'Karol Bagh, New Delhi',
      pickupLat: 28.6517,
      pickupLng: 77.1906,
      destinationAddress: 'Rajouri Garden, New Delhi',
      destinationLat: 28.6471,
      destinationLng: 77.1206,
      distance: 7.2,
      duration: 22,
      estimatedFare: 77.6,
      actualFare: 77.6,
      baseFare: 20,
      perKmCharge: 8,
      status: 'completed',
      paymentMethod: 'online',
      paymentStatus: 'completed',
      riderEarnings: 62.08,
      commission: 15.52,
      createdAt: new Date(Date.now() - 86400000),
    },
  ],

  pricing: {
    baseFare: 20,
    perKmCharge: 8,
    minimumFare: 30,
    waitingChargePerMin: 2,
    commissionPercent: 20,
    isActive: true,
  },

  ratings: [
    {
      _id: '6731a1b2c3d4e5f600000020',
      rideId: '6731a1b2c3d4e5f600000010',
      customerId: '6731a1b2c3d4e5f600000001',
      riderId: '6731a1b2c3d4e5f600000002',
      rating: 5,
      feedback: 'Very smooth ride, reached on time!',
      createdAt: new Date(),
    },
  ],

  generateId: () => {
    const crypto = require('crypto');
    return crypto.randomBytes(12).toString('hex');
  },
};

module.exports = inMemoryStore;

