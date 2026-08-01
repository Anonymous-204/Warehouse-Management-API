// src/Auth.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

export const api = axios.create({ 
  baseURL: 'http://localhost:3000', 
  withCredentials: true 
});

let tokenRAM = null;

api.interceptors.request.use((config) => {
  if (tokenRAM) {
    config.headers.Authorization = `Bearer ${tokenRAM}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Bỏ qua không retry nếu chính request /auth/refresh bị lỗi
    if (originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post('http://localhost:3000/auth/refresh', {}, { withCredentials: true });
        tokenRAM = res.data.accessToken;
        api.defaults.headers.common['Authorization'] = `Bearer ${tokenRAM}`;
        originalRequest.headers.Authorization = `Bearer ${tokenRAM}`;
        return api(originalRequest);
      } catch (refreshError) {
        tokenRAM = null;
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🟢 F5 tự đi lấy token mới + info user
    api.post('/auth/refresh')
      .then((res) => {
        tokenRAM = res.data.accessToken;
        api.defaults.headers.common['Authorization'] = `Bearer ${tokenRAM}`;
        // Lấy thông tin user bằng tokenRAM vừa có
        return api.get('/users/me', {
          headers: { Authorization: `Bearer ${tokenRAM}` }
        });
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        tokenRAM = null;
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (token, userData) => {
    tokenRAM = token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    tokenRAM = null;
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    api.post('/auth/logout').catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ Đang tải ứng dụng...</div>;
  return user ? children : <Navigate to="/login" replace />;
};