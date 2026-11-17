import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const api = axios.create({ baseURL: `${API_URL}/api`, timeout: 15000 });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rw_rider_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((r) => r, (error) => {
  if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
    localStorage.removeItem('rw_rider_token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});
export default api;
