import api from './api';

export const rideService = {
  bookRide: (data) => api.post('/rides/book', data),
  getRide: (id) => api.get(`/rides/${id}`),
  getRideHistory: (params) => api.get('/rides/history', { params }),
  cancelRide: (id, reason) => api.post(`/rides/${id}/cancel`, { cancellationReason: reason }),
  updateStatus: (id, status) => api.patch(`/rides/${id}/status`, { status }),
};

export const paymentService = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
};

export const ratingService = {
  createRating: (data) => api.post('/ratings', data),
  getRiderRatings: (riderId) => api.get(`/ratings/rider/${riderId}`),
};

export const profileService = {
  getProfile: () => api.get('/customers/profile'),
  updateProfile: (data) => api.put('/customers/profile', data),
};

