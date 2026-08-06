import React from 'react';
import { useAuth } from '../Auth';
import { useNavigate, Outlet, NavLink } from 'react-router-dom'; // 🟢 Dùng NavLink thay vì Link

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Xử lý khi chọn dropdown
  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (value === 'logout') {
      logout();
      navigate('/login');
    } else if (value === 'profile') {
      navigate('/profile');
    }
  };

  // 🟢 Hàm trả về style cho Link: nếu đang ở trang đó (isActive) thì đổi màu nền + chữ
  const getNavLinkStyle = ({ isActive }) => ({
    ...styles.navLink,
    ...(isActive ? styles.activeNavLink : {}),
  });

  return (
    <div style={styles.appContainer}>
      {/* 1. HEADER */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <h2>📦 WMS</h2>
        </div>
        <div>
          <h3 style={{ margin: 0 }}>Hệ thống quản lý kho hàng</h3>
        </div>

        <div style={styles.user}>
          <label htmlFor="userSelect">👤 {user?.name || 'Người dùng'}</label>

          <select
            id="userSelect"
            style={styles.select}
            onChange={handleSelectChange}
            defaultValue=""
          >
            <option value="" disabled hidden>
              Tùy chọn
            </option>
            <option value="profile">Thông tin cá nhân</option>
            <option value="logout">Đăng xuất</option>
          </select>
        </div>
      </header>

      {/* 2. BODY (SIDEBAR + MAIN) */}
      <div style={styles.bodyContainer}>
        {/* SIDEBAR BÊN TRÁI */}
        <aside style={styles.sidebar}>
          <nav>
            <ul style={styles.navList}>
              <li>
                {/* 🟢 Dùng end cho đường dẫn trang chủ '/' để tránh trùng khớp với tất cả trang khác */}
                <NavLink to="/" end style={getNavLinkStyle}>
                  🏠 Trang chủ
                </NavLink>
              </li>
              <li>
                <NavLink to="/products" style={getNavLinkStyle}>
                  📦 Sản phẩm
                </NavLink>
              </li>
              <li>
                <NavLink to="/warehouse" style={getNavLinkStyle}>
                  🏭 Quản lý Kho
                </NavLink>
              </li>
              <li>
                <NavLink to="/suppliers" style={getNavLinkStyle}>
                  🤝 Nhà cung cấp
                </NavLink>
              </li>
              <li style = {styles.disabled}>
                <NavLink to="/stock-transactions" style={getNavLinkStyle}>
                  📊 Giao dịch tồn kho
                </NavLink>
              </li>
              <li style = {styles.disabled}>
                <NavLink to="/history" style={getNavLinkStyle}>
                  📜 Lịch sử giao dịch
                </NavLink>
              </li>
              <li>
                <NavLink to="/employees" style={getNavLinkStyle}>
                  👥 Nhân sự
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main style={styles.mainContent}>
          <Outlet />
        </main>
      </div>

      {/* 3. FOOTER */}
      <footer style={styles.footer}>
        <p style={{ margin: 0 }}>
          &copy; 2026 Hệ thống quản lý kho hàng. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

// 🟢 KHAI BÁO STYLES
const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  header: {
    height: '60px',
    background: '#1e293b',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
  },
  logo: { color: '#38bdf8' },
  user: { display: 'flex', alignItems: 'center', gap: '10px' },
  select: { padding: '5px', borderRadius: '4px', cursor: 'pointer' },

  bodyContainer: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: { width: '220px', background: '#0f172a', padding: '15px 0' },
  navList: { listStyle: 'none', padding: 0, margin: 0 },

  // Style mặc định của link
  navLink: {
    display: 'block',
    padding: '12px 20px',
    color: '#94a3b8',
    textDecoration: 'none',
    borderBottom: '1px solid #1e293b',
    transition: 'all 0.2s ease-in-out',
  },

  // 🟢 Style khi ĐANG Ở TRANG ĐÓ (Active)
  activeNavLink: {
    backgroundColor: '#0284c7', // Nền xanh sáng nổi bật
    color: '#ffffff', // Chữ trắng
    fontWeight: 'bold',
    borderLeft: '4px solid #38bdf8', // Viền sáng bên trái
  },

  mainContent: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    background: '#f8fafc',
  },
  disabled: {
  opacity: '0.5',
  cursor: 'not-allowed',
  pointerEvents: 'none',
  },
  footer: {
    height: '35px',
    background: '#e2e8f0',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
  },
};