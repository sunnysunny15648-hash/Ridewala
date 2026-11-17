import api from './api';
export const authService = {
  login: (data) => api.post('/auth/login', data),
  registerRider: (data) => api.post('/auth/register-rider', data),
  getMe: () => api.get('/auth/me'),
};
