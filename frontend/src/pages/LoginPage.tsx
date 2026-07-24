import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Hook dùng để chuyển trang

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    try {
      // Backend sẽ tự set 2 Cookie: accessToken & refreshToken
      const res = await api.post('/auth/login', { email, password });

      setMessage(res.data?.message || 'Đăng nhập thành công!');

      // Chuyển sang Trang chủ (/) sau 0.5s cho mượt
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err: any) {
      setIsError(true);
      setMessage(
        err.response?.data?.message || 'Đăng nhập thất bại! Kiểm tra lại thông tin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '380px', margin: '60px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🔐 Đăng Nhập Hệ Thống</h2>

      {message && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: isError ? '#ffe6e6' : '#e6ffe6', color: isError ? '#c00' : '#080', fontSize: '14px', textAlign: 'center' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Email:</label>
          <input
            type="email"
            placeholder="admin@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Mật khẩu:</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px', backgroundColor: loading ? '#6c757d' : '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px' }}
        >
          {loading ? '⏳ Đang xử lý...' : 'Đăng Nhập'}
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  marginTop: '4px',
  boxSizing: 'border-box',
  borderRadius: '4px',
  border: '1px solid #ccc'
};