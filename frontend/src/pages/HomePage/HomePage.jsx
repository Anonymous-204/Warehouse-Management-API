// src/pages/HomePage/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, useAuth } from '../../Auth'; // 🟢 Import api và hook useAuth từ file Auth.jsx
import './HomePage.css';

const HomePage = () => {
  const { user, logout } = useAuth(); // Lấy thông tin user hiện tại và hàm logout
  const navigate = useNavigate();

  // State quản lý dữ liệu công khai (Ví dụ: danh sách sản phẩm/bài viết nổi bật)
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy dữ liệu công khai khi mở trang
  useEffect(() => {
    api.get('/products/featured') // Thay bằng API công khai bất kỳ bên NestJS
      .then((res) => setFeaturedItems(res.data))
      .catch((err) => console.log('Lỗi lấy dữ liệu trang chủ:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="homepage-wrapper">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER / NAVBAR (Thanh điều hướng trên cùng)
      ───────────────────────────────────────────────────────────── */}
      <header className="navbar">
        <div className="logo" onClick={() => navigate('/')}>
          🚀 My App
        </div>

        <nav className="nav-menu">
          <Link to="/">Trang chủ</Link>
          <Link to="/about">Giới thiệu</Link>
          <Link to="/products">Sản phẩm</Link>
        </nav>

        {/* Khối xử lý hiển thị theo trạng thái đăng nhập */}
        <div className="auth-buttons">
          {user ? (
            // TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP
            <div className="user-profile-menu">
              <span>👋 Chào, <strong>{user.name}</strong></span>
              <button 
                className="btn-dashboard" 
                onClick={() => navigate('/dashboard')}
              >
                Trang quản lý
              </button>
              <button className="btn-logout" onClick={logout}>
                Đăng xuất
              </button>
            </div>
          ) : (
            // TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP
            <div className="guest-menu">
              <Link to="/login" className="btn-login">
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION (Khu vực banner/giới thiệu nổi bật)
      ───────────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <h1>Hệ Thống Quản Lý Kho & Đơn Hàng</h1>
        <p>Giải pháp tối ưu hóa quy trình vận hành doanh nghiệp của bạn.</p>
        
        {!user && (
          <button className="btn-cta" onClick={() => navigate('/login')}>
            Bắt đầu ngay ➔
          </button>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN CONTENT (Nội dung chính / Dữ liệu từ API)
      ───────────────────────────────────────────────────────────── */}
      <main className="main-content">
        <h2>Sản phẩm / Nổi bật</h2>

        {loading ? (
          <p>⏳ Đang tải dữ liệu...</p>
        ) : (
          <div className="card-grid">
            {featuredItems.length > 0 ? (
              featuredItems.map((item) => (
                <div key={item.id} className="card-item">
                  <h3>{item.name}</h3>
                  <p>{item.description || 'Không có mô tả'}</p>
                </div>
              ))
            ) : (
              <p>Chưa có dữ liệu hiển thị.</p>
            )}
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────
          4. FOOTER (Chân trang)
      ───────────────────────────────────────────────────────────── */}
      <footer className="footer">
        <p>© 2026 My App. Built with NestJS & React.</p>
      </footer>

    </div>
  );
};

export default HomePage;