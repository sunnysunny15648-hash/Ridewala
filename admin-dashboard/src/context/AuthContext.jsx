import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('rw_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];
  }, [token]);

  useEffect(() => {
    const validate = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.user.role !== 'admin') throw new Error('Not admin');
        setUser(data.user);
      } catch {
        localStorage.removeItem('rw_admin_token');
        setToken(null); setUser(null);
      } finally { setLoading(false); }
    };
    validate();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    if (data.user.role !== 'admin') throw new Error('Admin access only');
    localStorage.setItem('rw_admin_token', data.token);
    setToken(data.token);
    setUser(data.user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rw_admin_token');
    setToken(null); setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

