import React, { useState } from 'react';
import './LoginPage.css'; 
import { useNavigate } from 'react-router-dom';
import { api, useAuth } from '../../Auth'; // 🟢 Import api và useAuth từ file Auth.jsx

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // 🟢 Lấy hàm login từ AuthContext

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 🟢 Dùng `api.post` thay vì `axios.post`
      const res = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      // 🟢 Nạp Token vào RAM + cập nhật User State
      login(res.data.accessToken, res.data.user);

      setMessage({ type: 'success', text: 'Đăng nhập thành công!' });
      
      setTimeout(() => {
        navigate('/'); // Chuyển về trang chủ
      }, 1000);
    } catch (error) {
      console.error('Lỗi gọi API:', error);
      const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại!';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-card">
        <h2 className="login-title">ĐĂNG NHẬP</h2>

        {message.text && (
          <div className={`alert-message ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu:</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? '⏳ Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;