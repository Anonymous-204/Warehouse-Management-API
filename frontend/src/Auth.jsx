// src/Auth.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

// Create Axios Instance
export const api = axios.create({ baseURL: 'http://localhost:3000', withCredentials: true });

let tokenRAM = null; // Token lưu tạm trong RAM

// Gán Bearer Header tự động
api.interceptors.request.use((config) => {
  if (tokenRAM) config.headers.Authorization = `Bearer ${tokenRAM}`;
  return config;
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // F5 tự đi lấy token mới + info user
    api.post('/auth/refresh')
      .then((res) => {
        tokenRAM = res.data.accessToken;
        return api.get('/auth/me');
      })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = (token, userData) => {
    tokenRAM = token;
    setUser(userData);
  };

  const logout = () => {
    tokenRAM = null;
    setUser(null);
    api.post('/auth/logout');
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

// Component chặn trang gói gọn tại đây luôn
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>⏳ Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};