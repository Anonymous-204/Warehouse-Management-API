import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../Auth';

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1100px',
    margin: '0 auto',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '16px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  badge: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
  },
  alertLoading: {
    padding: '16px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '500',
  },
  alertError: {
    padding: '16px',
    backgroundColor: '#fde8e8',
    color: '#9b1c1c',
    borderRadius: '8px',
    border: '1px solid #f8b4b4',
    textAlign: 'center',
    fontSize: '15px',
    fontWeight: '500',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    color: '#6b7280',
    border: '1px dashed #d1d5db',
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    fontWeight: '600',
    fontSize: '14px',
    padding: '14px 16px',
    borderBottom: '1px solid #e5e7eb',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '14px 16px',
    color: '#1f2937',
    fontSize: '15px',
    verticalAlign: 'middle',
  },
  idTag: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '13px',
  },
  nameText: {
    fontWeight: '600',
    color: '#111827',
  },
};

const WarehousePage = () => {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchWarehouse = async () => {
      if (!user?.role) {
        if (isMounted) {
          setLoading(false);
          setError('Không tìm thấy thông tin tài khoản hiện tại!');
        }
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/warehouses');
        if (isMounted) {
          setWarehouses(res.data || []);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu kho:', err);
        if (isMounted) {
          setError(
            err.response?.data?.message || 'Không thể tải dữ liệu kho từ Server!'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWarehouse();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏬 Quản lý danh sách kho</h1>
        {!loading && !error && (
          <span style={styles.badge}>
            Tổng số: {warehouses.length} kho
          </span>
        )}
      </div>

      {/* Trang thái Loading */}
      {loading && (
        <div style={styles.alertLoading}>
          ⏳ Đang tải dữ liệu danh sách kho...
        </div>
      )}

      {/* Trạng thái Lỗi */}
      {error && <div style={styles.alertError}>❌ {error}</div>}

      {/* Danh sách dữ liệu */}
      {!loading && !error && (
        <>
          {warehouses.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: '18px', margin: 0 }}>📭 Hiện chưa có kho nào trong hệ thống.</p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '90px' }}>Mã số</th>
                    <th style={{ ...styles.th, width: '220px' }}>Tên kho</th>
                    <th style={styles.th}>Mô tả</th>
                    <th style={{ ...styles.th, width: '300px' }}>Địa chỉ</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((warehouse) => (
                    <tr
                      key={warehouse.id}
                      style={styles.tr}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = '#f9fafb')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                    >
                      <style>{`
                        tr:hover { backgroundColor: #f9fafb; }
                      `}</style>
                      <td style={styles.td}>
                        <span style={styles.idTag}>#{warehouse.id}</span>
                      </td>
                      <td style={{ ...styles.td, ...styles.nameText }}>
                        {warehouse.name}
                      </td>
                      <td style={{ ...styles.td, color: '#4b5563' }}>
                        {warehouse.description || '—'}
                      </td>
                      <td style={styles.td}>{warehouse.address || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WarehousePage;