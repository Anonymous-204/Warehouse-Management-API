import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../Auth'; // 🟢 Import đúng ngoặc nhọn { api }

const HomePage = () => {
  const { user } = useAuth();
  
  // State lưu dữ liệu API, loading và lỗi
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🟢 Gọi API lấy dữ liệu Dashboard thật
  useEffect(() => {
    let isMounted = true;

    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        // Gọi thẳng bằng api đã set Interceptor trong Auth.jsx
        const res = await api.get('/inventory/dashboard/stats');
        if (isMounted) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu Dashboard:', err);
        if (isMounted) setError('Không thể tải dữ liệu thống kê từ Server!');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper định dạng tiền VNĐ (vd: 45000000 -> 45.000.000 ₫)
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Helper định dạng phân cách số hàng nghìn (vd: 8420 -> 8,420)
  const formatNumber = (num) => {
    return (num || 0).toLocaleString('en-US');
  };

  // 📊 Mảng Mapping dữ liệu từ API sang giao diện Cards
  const statsData = [
    { id: 1, title: 'Tổng sản phẩm', value: formatNumber(stats?.totalProducts), icon: '📦', color: '#2563EB', bgColor: '#EFF6FF' },
    { id: 2, title: 'Tổng Tồn Kho', value: formatNumber(stats?.totalInventory), icon: '🏬', color: '#4F46E5', bgColor: '#EEF2FF' },
    { id: 3, title: 'Sản phẩm sắp hết (<10)', value: formatNumber(stats?.lowStock), icon: '⚠️', color: '#D97706', bgColor: '#FEF3C7', badge: true, type: 'warning' },
    { id: 4, title: 'Sản phẩm Hết Hàng', value: formatNumber(stats?.outOfStock), icon: '⛔', color: '#DC2626', bgColor: '#FEE2E2', badge: true, type: 'danger' },
    { id: 5, title: 'Tổng Số Kho', value: formatNumber(stats?.totalWarehouses), icon: '🏬', color: '#0D9488', bgColor: '#CCFBF1' },
    { id: 6, title: 'Tổng Nhân viên', value: formatNumber(stats?.totalEmployees), icon: '👤', color: '#059669', bgColor: '#D1FAE5' },
    { id: 7, title: 'Đơn nhập hôm nay', value: formatNumber(stats?.todayImport), icon: '📥', color: '#0284C7', bgColor: '#E0F2FE' },
    { id: 8, title: 'Đơn xuất hôm nay', value: formatNumber(stats?.todayExport), icon: '📤', color: '#7C3AED', bgColor: '#F3E8FF' },
    { id: 9, title: 'Điều chỉnh hôm nay', value: formatNumber(stats?.todayAdjust), icon: '📝', color: '#6B7280', bgColor: '#F3F4F6' },
    { id: 10, title: 'Chuyển kho hôm nay', value: formatNumber(stats?.todayTransfer), icon: '🚚', color: '#EA580C', bgColor: '#FFEDD5' },
    { id: 11, title: 'Giá trị nhập hôm nay', value: formatVND(stats?.todayImportValue), icon: '📈', color: '#16A34A', bgColor: '#DCFCE7' },
    { id: 12, title: 'Giá trị xuất hôm nay', value: formatVND(stats?.todayExportValue), icon: '📉', color: '#2563EB', bgColor: '#EFF6FF' },
  ];

  return (
    <div style={styles.pageLayout}>
      {/* Header trang chủ */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏠 Trang chủ Dashboard</h1>
        {user && <p style={styles.welcomeText}>Xin chào, <strong>{user.name || user.email}</strong>!</p>}
      </div>

      {/* Hiển thị Loading hoặc Error nếu có */}
      {loading && <div style={styles.loadingText}>⏳ Đang tải dữ liệu thống kê...</div>}
      {error && <div style={styles.errorText}>⚠️ {error}</div>}

      {/* Grid chứa danh sách các Cards */}
      {!loading && !error && (
        <div style={styles.gridContainer}>
          {statsData.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={{ ...styles.iconBox, backgroundColor: item.bgColor }}>
                <span style={styles.icon}>{item.icon}</span>
              </div>
              
              <div style={styles.cardContent}>
                <span style={styles.cardTitle}>{item.title}</span>
                
                <div style={styles.valueRow}>
                  {item.badge ? (
                    <span style={item.type === 'danger' ? styles.badgeDanger : styles.badgeWarning}>
                      {item.value}
                    </span>
                  ) : (
                    <h3 style={{ ...styles.cardValue, color: item.color }}>{item.value}</h3>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 💡 Styles bao gồm thêm phần loading & error
const styles = {
  pageLayout: {
    padding: '24px',
    maxWidth: '1280px',
    margin: '0 auto',
    boxSizing: 'border-box',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  header: {
    marginBottom: '28px',
    textAlign: 'left',
  },
  title: {
    margin: '0 0 8px 0',
    color: '#111827',
    fontSize: '26px',
    fontWeight: '700',
  },
  welcomeText: {
    color: '#6B7280',
    margin: 0,
    fontSize: '15px',
  },
  loadingText: {
    padding: '20px 0',
    fontSize: '16px',
    color: '#4B5563',
  },
  errorText: {
    padding: '20px 0',
    fontSize: '16px',
    color: '#DC2626',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: '22px',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flexGrow: 1,
  },
  cardTitle: {
    fontSize: '13px',
    color: '#6B7280',
    fontWeight: '500',
  },
  valueRow: {
    display: 'flex',
    alignItems: 'center',
  },
  cardValue: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontWeight: '700',
    fontSize: '16px',
    display: 'inline-block',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontWeight: '700',
    fontSize: '16px',
    display: 'inline-block',
  },
};

export default HomePage;