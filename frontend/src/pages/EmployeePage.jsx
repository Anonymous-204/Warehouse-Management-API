import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../Auth';

const EmployeePage = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchEmployees = async () => {
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
        // Thay đổi endpoint nếu API của bạn sử dụng /users thay vì /employees
        const res = await api.get('/users/employees');
        if (isMounted) {
          setEmployees(res.data || []);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu nhân viên:', err);
        if (isMounted) {
          setError(
            err.response?.data?.message || 'Không thể tải dữ liệu nhân viên từ Server!'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEmployees();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Hàm định dạng thời gian createdAt
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Quản lý nhân viên</h1>
        {!loading && !error && (
          <span style={styles.badge}>
            Tổng số: {employees.length} nhân viên
          </span>
        )}
      </div>

      {/* Trạng thái Loading */}
      {loading && (
        <div style={styles.alertLoading}>
          ⏳ Đang tải danh sách nhân viên...
        </div>
      )}

      {/* Trạng thái Lỗi */}
      {error && <div style={styles.alertError}>❌ {error}</div>}

      {/* Danh sách dữ liệu */}
      {!loading && !error && (
        <>
          {employees.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: '18px', margin: 0 }}>📭 Hiện chưa có nhân viên nào trong hệ thống.</p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '220px' }}>Họ và tên</th>
                    <th style={{ ...styles.th, width: '250px' }}>Email</th>
                    <th style={{ ...styles.th, width: '200px' }}>Kho làm việc</th>
                    <th style={{ ...styles.th, width: '160px' }}>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr
                      key={emp.id}
                      style={styles.tr}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = '#f9fafb')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                    >
                      {/* Name */}
                      <td style={{ ...styles.td, ...styles.nameText }}>
                        {emp.name}
                      </td>

                      {/* Email */}
                      <td style={{ ...styles.td, color: '#374151' }}>
                        {emp.email}
                      </td>

                      {/* Warehouse Name */}
                      <td style={styles.td}>
                        {emp.warehouse?.name ? (
                          <span style={styles.warehouseTag}>
                            🏬 {emp.warehouse.name}
                          </span>
                        ) : (
                          <span style={styles.noWarehouse}>Chưa gán kho</span>
                        )}
                      </td>

                      {/* CreatedAt */}
                      <td style={{ ...styles.td, color: '#6b7280', fontSize: '14px' }}>
                        {formatDate(emp.createdAt)}
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
    padding: '14px 16px',
    color: '#1f2937',
    fontSize: '15px',
    verticalAlign: 'middle',
  },
  nameText: {
    fontWeight: '600',
    color: '#111827',
  },
  warehouseTag: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #bbf7d0',
    display: 'inline-block',
  },
  noWarehouse: {
    color: '#9ca3af',
    fontStyle: 'italic',
    fontSize: '14px',
  },
};

export default EmployeePage;