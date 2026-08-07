import { useEffect, useState } from 'react';
import { useAuth, api } from '../Auth';

const InventoryPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      if (user?.role !== 'ADMIN' && !user?.warehouseId) {
        if (isMounted) {
          setLoading(false);
          setError('Không tìm thấy thông tin kho của tài khoản hiện tại!');
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/inventory/warehouse/${user.warehouseId}`);
        if (isMounted) {
          setProducts(res.data || []);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu sản phẩm:', err);
        if (isMounted) {
          setError(
            err.response?.data?.message || 'Không thể tải dữ liệu sản phẩm từ Server!'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [user?.warehouseId, user?.role]);

  // Helper định dạng tiền VNĐ
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Helper hiển thị an toàn
  const renderValue = (val) => {
    if (!val) return '---';
    if (typeof val === 'object') return val.name || val.title || JSON.stringify(val);
    return val;
  };

  return (
    <div style={styles.container}>
      {/* Header trang */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📦 Danh sách sản phẩm</h1>
          <p style={styles.subtitle}>
            Quản lý tồn kho cho <strong>Kho #{user?.warehouseId || 'N/A'}</strong>
          </p>
        </div>
      </div>

      {/* Hiển thị Loading / Error */}
      {loading && <div style={styles.loadingBox}>⏳ Đang tải dữ liệu sản phẩm...</div>}
      {error && <div style={styles.errorBox}>⚠️ {error}</div>}

      {/* Bảng dữ liệu hiển thị khi đã load xong */}
      {!loading && !error && (
        <div style={styles.tableCard}>
          {products && products.length > 0 ? (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>SKU</th>
                    <th style={styles.th}>Tên sản phẩm</th>
                    <th style={styles.th}>Giá bán</th>
                    <th style={styles.th}>Số lượng</th>
                    <th style={styles.th}>Danh mục</th>
                    <th style={styles.th}>Hãng</th>
                    <th style={styles.th}>Nhà cung cấp</th>
                    <th style={styles.th}>Kho</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => {
                    const quantity = item.quantity ?? item.stock ?? 0;
                    return (
                      <tr key={item.id || item.sku} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: '600', color: '#2563EB' }}>
                          {item.sku || '---'}
                        </td>
                        <td style={{ ...styles.td, fontWeight: '500', color: '#111827' }}>
                          {item.name}
                        </td>
                        <td style={{ ...styles.td, color: '#16A34A', fontWeight: '600' }}>
                          {formatVND(item.price)}
                        </td>
                        <td style={styles.td}>
                          <span style={quantity < 10 ? styles.badgeWarning : styles.badgeSuccess}>
                            {quantity}
                          </span>
                        </td>
                        <td style={styles.td}>{renderValue(item.category)}</td>
                        <td style={styles.td}>{renderValue(item.brand)}</td>
                        <td style={styles.td}>{renderValue(item.supplier)}</td>
                        <td style={styles.td}>{renderValue(item.warehouse)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.emptyBox}>📭 Không có sản phẩm nào trong kho này.</div>
          )}
        </div>
      )}
    </div>
  );
};

// CẤU HÌNH STYLES
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1280px',
    margin: '0 auto',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  header: {
    marginBottom: '20px',
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0F172A',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748B',
    margin: 0,
  },
  loadingBox: {
    padding: '24px',
    textAlign: 'center',
    color: '#475569',
    fontSize: '15px',
  },
  errorBox: {
    padding: '16px',
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    borderRadius: '8px',
    border: '1px solid #FEE2E2',
    fontSize: '14px',
    marginBottom: '20px',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px',
  },
  th: {
    backgroundColor: '#F8FAFC',
    color: '#475569',
    padding: '12px 16px',
    fontWeight: '600',
    borderBottom: '1px solid #E2E8F0',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #F1F5F9',
  },
  td: {
    padding: '14px 16px',
    color: '#334155',
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontWeight: '600',
    fontSize: '12px',
    display: 'inline-block',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
    color: '#B45309',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontWeight: '600',
    fontSize: '12px',
    display: 'inline-block',
  },
  emptyBox: {
    padding: '40px',
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: '15px',
  },
};

export default InventoryPage;