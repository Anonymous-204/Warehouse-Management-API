import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, useAuth } from '../Auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

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
      const res = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      login(res.data.accessToken, res.data.user);

      setMessage({ type: 'success', text: 'Đăng nhập thành công!' });

      setTimeout(() => {
        navigate('/');
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
    <div style={styles.pageWrapper}>
      <div style={styles.loginCard}>
        <h2 style={styles.loginTitle}>ĐĂNG NHẬP</h2>

        {message.text && (
          <div
            style={{
              ...styles.alertMessage,
              ...(message.type === 'error' ? styles.alertError : styles.alertSuccess),
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.loginForm}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mật khẩu:</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.btnSubmit,
              ...(loading ? styles.btnSubmitDisabled : {}),
            }}
          >
            {loading ? '⏳ Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};
const styles = {
  pageWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '20px',
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    padding: '32px 24px',
    boxSizing: 'border-box',
  },
  loginTitle: {
    margin: '0 0 24px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  alertMessage: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid',
    textAlign: 'center',
  },
  alertError: {
    backgroundColor: '#fde8e8',
    color: '#9b1c1c',
    borderColor: '#f8b4b4',
  },
  alertSuccess: {
    backgroundColor: '#e1f9eb',
    color: '#03543f',
    borderColor: '#84e1bc',
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
    outline: 'none',
  },
  btnSubmit: {
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '8px',
    cursor: 'pointer',
  },
  btnSubmitDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
};
export default LoginPage;
