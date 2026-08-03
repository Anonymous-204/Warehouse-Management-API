import React from 'react';
import { useAuth } from '../Auth';
import { useNavigate, Outlet, Link } from 'react-router-dom';

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

  return (
    <div style={styles.appContainer}>
      {/* 1. HEADER */}
      <header style={styles.header}>
        <div style={styles.logo}><h2>📦 WMS</h2></div>
        <div><h3 style={{ margin: 0 }}>Hệ thống quản lý kho hàng</h3></div>
        
        <div style={styles.user}>
          <label htmlFor="userSelect">👤 {user.name}</label> 
          
          {/* Bắt onChange ở đây thay vì onClick ở option */}
          <select 
            id="userSelect" 
            style={styles.select} 
            onChange={handleSelectChange}
            defaultValue=""
          >
            <option value="" disabled hidden>Tùy chọn</option>
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
              <li><Link to="/" style={styles.navLink}>🏠 Trang chủ</Link></li>
              <li><Link to="/products" style={styles.navLink}>📦 Sản phẩm</Link></li>
              <li><Link to="/warehouse" style={styles.navLink}>🏭 Quản lý Kho</Link></li>
              <li><Link to="/stock-transactions" style={styles.navLink}>📊 Giao dịch tồn kho</Link></li>
              <li><Link to="/employees" style={styles.navLink}>👥 Người dùng</Link></li>
            </ul>
          </nav>
        </aside>

        {/* MAIN CONTENT (Nơi HomePage hiện ra) */}
        <main style={styles.mainContent}>
          <Outlet /> 
        </main>
      </div>

      {/* 3. FOOTER */}
      <footer style={styles.footer}>
        <p style={{ margin: 0 }}>&copy; 2026 Hệ thống quản lý kho hàng. All rights reserved.</p>
      </footer>
    </div>
  );
}

// 🟢 KHAI BÁO STYLES (Đảm bảo không bị trống giao diện)
const styles = {
  appContainer: { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  header: { height: '60px', background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' },
  logo: { color: '#38bdf8' },
  user: { display: 'flex', alignItems: 'center', gap: '10px' },
  select: { padding: '5px', borderRadius: '4px', cursor: 'pointer' },
  
  bodyContainer: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: { width: '220px', background: '#0f172a', padding: '15px 0' },
  navList: { listStyle: 'none', padding: 0, margin: 0 },
  navLink: { display: 'block', padding: '12px 20px', color: '#94a3b8', textDecoration: 'none', borderBottom: '1px solid #1e293b' },
  
  mainContent: { flex: 1, padding: '20px', overflowY: 'auto', background: '#f8fafc' },
  footer: { height: '35px', background: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }
};