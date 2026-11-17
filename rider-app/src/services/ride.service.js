import api from './api';
export const rideService = {
  getRideHistory: (params) => api.get('/riders/rides', { params }),
  acceptRide: (id) => api.post(`/rides/${id}/accept`),
  updateStatus: (id, status) => api.patch(`/rides/${id}/status`, { status }),
  cancelRide: (id, reason) => api.post(`/rides/${id}/cancel`, { cancellationReason: reason }),
  updateLocation: (lat, lng) => api.put('/riders/location', { lat, lng }),
  toggleAvailability: (isOnline) => api.patch('/riders/availability', { isOnline }),
  getEarnings: (period) => api.get('/riders/earnings', { params: { period } }),
};
