import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../Auth';

const SupplierPage = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSuppliers = async () => {
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
        const res = await api.get('/suppliers');
        if (isMounted) {
          setSuppliers(res.data || []);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu nhà cung cấp:', err);
        if (isMounted) {
          setError(
            err.response?.data?.message || 'Không thể tải dữ liệu nhà cung cấp từ Server!'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSuppliers();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🤝 Quản lý nhà cung cấp</h1>
        {!loading && !error && (
          <span style={styles.badge}>
            Tổng số: {suppliers.length} nhà cung cấp
          </span>
        )}
      </div>

      {/* Trạng thái Loading */}
      {loading && (
        <div style={styles.alertLoading}>
          ⏳ Đang tải danh sách nhà cung cấp...
        </div>
      )}

      {/* Trạng thái Lỗi */}
      {error && <div style={styles.alertError}>❌ {error}</div>}

      {/* Danh sách dữ liệu */}
      {!loading && !error && (
        <>
          {suppliers.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: '18px', margin: 0 }}>📭 Hiện chưa có nhà cung cấp nào trong hệ thống.</p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '90px' }}>Mã số</th>
                    <th style={{ ...styles.th, width: '100px' }}>Hình ảnh</th>
                    <th style={{ ...styles.th, width: '250px' }}>Tên nhà cung cấp</th>
                    <th style={styles.th}>Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      style={styles.tr}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = '#f9fafb')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                    >
                      {/* ID */}
                      <td style={styles.td}>
                        <span style={styles.idTag}>#{supplier.id}</span>
                      </td>

                      {/* Image */}
                      <td style={styles.td}>
                        {supplier.image ? (
                          <img
                            src={supplier.image}
                            alt={supplier.name}
                            style={styles.image}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/50?text=No+Img';
                            }}
                          />
                        ) : (
                          <div style={styles.noImage}>Không ảnh</div>
                        )}
                      </td>

                      {/* Name */}
                      <td style={{ ...styles.td, ...styles.nameText }}>
                        {supplier.name}
                      </td>

                      {/* Description */}
                      <td style={{ ...styles.td, color: '#4b5563' }}>
                        {supplier.description || '—'}
                      </td>
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
    padding: '12px 16px',
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
  image: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid #e5e7eb',
  },
  noImage: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    textAlign: 'center',
  },
};

export default SupplierPage;