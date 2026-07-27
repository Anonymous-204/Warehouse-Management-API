import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

// 1. Kiểu dữ liệu UserProfile
interface UserProfile {
  id: number;
  email: string;
  name?: string;
  role: 'STAFF' | 'MANAGER' | 'ADMIN';
  warehouseId?: number;
}

// 2. Cấu trúc dữ liệu Lịch sử giao dịch
interface TransactionHistoryItem {
  id: number;
  createdAt: string;
  type?: 'IN' | 'OUT' | 'IMPORT' | 'EXPORT' | 'ADJUST' | 'TRANSFER' | string;
  action?: string;
  quantity?: number;
  adjustedQuantity?: number;
  quantityChange?: number;
  transferredQuantity?: number;
  stockVariance?: number; // Trường độ lệch (Chênh lệch tồn kho)
  note?: string;
  reason?: string;

  // Thông tin Nhân viên thực hiện giao dịch
  user?: {
    id?: number;
    name?: string;
    email?: string;
  };
  createdBy?: {
    id?: number;
    name?: string;
    email?: string;
  };
  staff?: {
    id?: number;
    name?: string;
    email?: string;
  };

  // Quan hệ Sản phẩm
  product?: {
    id?: number;
    sku?: string;
    name?: string;
    price?: number;
  };

  // Quan hệ Kho
  warehouse?: {
    id?: number;
    name?: string;
  };
  fromWarehouse?: {
    id?: number;
    name?: string;
  };
  toWarehouse?: {
    id?: number;
    name?: string;
  };
}

export default function UserHistoryPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // State quản lý tab và dữ liệu
  const [activeTab, setActiveTab] = useState<'IO' | 'ADJUST' | 'TRANSFER'>('IO');
  const [historyData, setHistoryData] = useState<TransactionHistoryItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  // 1. Lấy thông tin User
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // 2. Hàm gọi API lấy lịch sử theo tab
  const fetchHistory = async (tab: 'IO' | 'ADJUST' | 'TRANSFER') => {
    setLoadingData(true);
    setErrorMsg('');
    setActiveTab(tab);

    let endpoint = '';
    if (tab === 'IO') endpoint = 'products/history/me/io';
    else if (tab === 'ADJUST') endpoint = 'products/history/me/adjust';
    else if (tab === 'TRANSFER') endpoint = 'products/history/me/transfer';

    try {
      const res = await api.get(endpoint);
      const rawData = res.data?.data || res.data || [];
      const list: TransactionHistoryItem[] = Array.isArray(rawData) ? rawData : [];

      // Logic lọc lại ở Frontend
      const filteredList = list.filter((item) => {
        const type = (item.type || item.action || '').toUpperCase();
        if (tab === 'IO') {
          return ['IN', 'OUT', 'IMPORT', 'EXPORT'].includes(type);
        }
        if (tab === 'ADJUST') {
          return type === 'ADJUST';
        }
        if (tab === 'TRANSFER') {
          return type === 'TRANSFER';
        }
        return true;
      });

      setHistoryData(filteredList);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setErrorMsg('Bạn không có quyền xem loại lịch sử này!');
      } else {
        setErrorMsg('Không thể tải dữ liệu lịch sử. Vui lòng thử lại!');
      }
      setHistoryData([]);
    } finally {
      setLoadingData(false);
    }
  };

  // Tự động tải Tab IO khi load xong User
  useEffect(() => {
    if (user) {
      fetchHistory('IO');
    }
  }, [user]);

  // 3. Phân quyền truy cập nút
  const canAccess = (action: 'IO' | 'ADJUST' | 'TRANSFER' | 'STAFF_LIST') => {
    if (!user) return false;
    const role = user.role;

    if (action === 'IO') return ['STAFF', 'MANAGER', 'ADMIN'].includes(role);
    if (action === 'ADJUST') return ['MANAGER', 'ADMIN'].includes(role);
    if (action === 'TRANSFER' || action === 'STAFF_LIST') return role === 'ADMIN';
    return false;
  };

  // 4. Render Badge hiển thị loại lịch sử
  const renderTypeBadge = (item: TransactionHistoryItem) => {
    const rawType = (item.type || item.action || '').toUpperCase();

    if (['IN', 'IMPORT'].includes(rawType)) {
      return <span style={badgeStyle('#d1e7dd', '#0f5132')}>📥 Nhập kho</span>;
    }
    if (['OUT', 'EXPORT'].includes(rawType)) {
      return <span style={badgeStyle('#f8d7da', '#842029')}>📤 Xuất kho</span>;
    }
    if (rawType === 'ADJUST') {
      return <span style={badgeStyle('#fff3cd', '#664d03')}>📝 Điều chỉnh</span>;
    }
    if (rawType === 'TRANSFER') {
      return <span style={badgeStyle('#cff4fc', '#055160')}>🚚 Điều chuyển</span>;
    }

    return <span style={badgeStyle('#e2e3e5', '#41464b')}>{rawType || 'N/A'}</span>;
  };

  // 5. Render Số lượng linh hoạt theo loại tab
  const getDisplayQuantity = (item: TransactionHistoryItem) => {
    const qty = item.quantity ?? item.quantityChange ?? item.adjustedQuantity ?? item.transferredQuantity ?? 0;
    const rawType = (item.type || item.action || '').toUpperCase();

    if (rawType === 'ADJUST') {
      return <span style={{ color: '#000000', fontWeight: 'bold' }}>{Math.abs(qty)}</span>;
    }

    if (['IN', 'IMPORT'].includes(rawType)) {
      return <span style={{ color: '#198754', fontWeight: 'bold' }}>+{Math.abs(qty)}</span>;
    }
    if (['OUT', 'EXPORT'].includes(rawType)) {
      return <span style={{ color: '#dc3545', fontWeight: 'bold' }}>-{Math.abs(qty)}</span>;
    }

    return <span style={{ color: '#000000', fontWeight: 'bold' }}>{qty}</span>;
  };

  // 6. Render Giá trị Độ lệch (Stock Variance)
  const renderStockVariance = (item: TransactionHistoryItem) => {
    const variance = item.stockVariance;

    if (variance === undefined || variance === null) {
      return <span style={{ color: '#6c757d' }}>---</span>;
    }

    if (variance > 0) {
      return <span style={{ color: '#198754', fontWeight: 'bold' }}>+{variance}</span>;
    }
    if (variance < 0) {
      return <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{variance}</span>;
    }

    return <span style={{ color: '#6c757d', fontWeight: 'bold' }}>0</span>;
  };

  // 7. Render Tên nhân viên thực hiện
  const renderStaffName = (item: TransactionHistoryItem) => {
    const staffObj = item.user || item.createdBy || item.staff;
    if (staffObj) {
      return staffObj.name || staffObj.email || 'N/A';
    }
    return user?.name || user?.email || 'N/A';
  };

  // 8. Render thông tin kho
  const renderWarehouseInfo = (item: TransactionHistoryItem) => {
    if (item.fromWarehouse || item.toWarehouse) {
      return (
        <span>
          {item.fromWarehouse?.name || '---'} ➔ <strong>{item.toWarehouse?.name || '---'}</strong>
        </span>
      );
    }
    return item.warehouse?.name || '---';
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Đang xác thực thông tin...</div>;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      {/* Header trang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '15px 20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        <div>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '6px 12px', marginBottom: '8px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
          >
            ⬅ Quay lại Trang chủ
          </button>
          <h3 style={{ margin: 0 }}>📜 Lịch Sử Hoạt Động Của Tôi</h3>
          {user && (
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6c757d' }}>
              Người dùng: <strong>{user.name || user.email}</strong> | Quyền: <span style={{ color: '#0d6efd', fontWeight: 'bold' }}>{user.role}</span>
            </p>
          )}
        </div>

        {canAccess('STAFF_LIST') && (
          <button
            onClick={() => navigate('/admin/users')}
            style={{
              padding: '10px 16px',
              backgroundColor: '#6f42c1',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            👥 Quản lý Nhân viên
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          disabled={!canAccess('IO')}
          onClick={() => fetchHistory('IO')}
          style={getTabButtonStyle(activeTab === 'IO', canAccess('IO'), '#0d6efd')}
        >
          📦 Lịch sử Nhập / Xuất kho
        </button>

        <button
          disabled={!canAccess('ADJUST')}
          onClick={() => fetchHistory('ADJUST')}
          style={getTabButtonStyle(activeTab === 'ADJUST', canAccess('ADJUST'), '#fd7e14')}
        >
          📝 Lịch sử Điều chỉnh kho
        </button>

        <button
          disabled={!canAccess('TRANSFER')}
          onClick={() => fetchHistory('TRANSFER')}
          style={getTabButtonStyle(activeTab === 'TRANSFER', canAccess('TRANSFER'), '#198754')}
        >
          🚚 Lịch sử Điều chuyển kho
        </button>
      </div>

      {/* Thông báo lỗi */}
      {errorMsg && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8d7da', color: '#842029', borderRadius: '4px' }}>
          {errorMsg}
        </div>
      )}

      {/* Bảng dữ liệu Lịch sử */}
      <div style={{ marginTop: '25px' }}>
        {loadingData ? (
          <p style={{ textAlign: 'center', color: '#6c757d', padding: '30px' }}>⏳ Đang tải dữ liệu lịch sử...</p>
        ) : (
          <div>
            <h4 style={{ marginBottom: '10px' }}>
              📋 Danh sách: {activeTab === 'IO' ? 'Nhập / Xuất' : activeTab === 'ADJUST' ? 'Điều chỉnh' : 'Điều chuyển'} ({historyData.length} bản ghi)
            </h4>

            {historyData.length === 0 ? (
              <p style={{ fontStyle: 'italic', color: '#6c757d', padding: '20px', textAlign: 'center', border: '1px dashed #ced4da', borderRadius: '6px' }}>
                Không tìm thấy bản ghi lịch sử nào phù hợp với loại này.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#212529', color: '#fff' }}>
                      <th style={thStyle}>Thời gian</th>
                      <th style={thStyle}>Loại</th>
                      <th style={thStyle}>Nhân viên</th>
                      <th style={thStyle}>Tên sản phẩm</th>
                      <th style={thStyle}>SKU</th>
                      <th style={thStyle}>Số lượng</th>
                      
                      {/* 🔴 CHỈ HIỂN THỊ CỘT ĐỘ LỆCH KHI Ở TAB ĐIỀU CHỈNH (ADJUST) */}
                      {activeTab === 'ADJUST' && <th style={thStyle}>Độ lệch</th>}
                      
                      <th style={thStyle}>Kho</th>
                      <th style={thStyle}>Ghi chú / Lý do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((item, index) => (
                      <tr key={item.id || index} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                        <td style={tdStyle}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '---'}
                        </td>
                        <td style={tdStyle}>{renderTypeBadge(item)}</td>
                        <td style={tdStyle}><strong>{renderStaffName(item)}</strong></td>
                        <td style={tdStyle}><strong>{item.product?.name || '---'}</strong></td>
                        <td style={tdStyle}><code>{item.product?.sku || '---'}</code></td>
                        <td style={tdStyle}>{getDisplayQuantity(item)}</td>

                        {/* 🔴 CHỈ HIỂN THỊ DỮ LIỆU ĐỘ LỆCH KHI Ở TAB ĐIỀU CHỈNH (ADJUST) */}
                        {activeTab === 'ADJUST' && <td style={tdStyle}>{renderStockVariance(item)}</td>}

                        <td style={tdStyle}>{renderWarehouseInfo(item)}</td>
                        <td style={tdStyle}>{item.note || item.reason || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// STYLES HỖ TRỢ
const thStyle: React.CSSProperties = { padding: '10px 12px', border: '1px solid #343a40' };
const tdStyle: React.CSSProperties = { padding: '10px 12px' };

const badgeStyle = (bgColor: string, textColor: string): React.CSSProperties => ({
  padding: '3px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold',
  backgroundColor: bgColor,
  color: textColor,
  display: 'inline-block',
});

const getTabButtonStyle = (isActive: boolean, isAllowed: boolean, activeColor: string): React.CSSProperties => {
  if (!isAllowed) {
    return {
      padding: '10px 18px',
      backgroundColor: '#e9ecef',
      color: '#adb5bd',
      border: '1px solid #ced4da',
      borderRadius: '6px',
      cursor: 'not-allowed',
      fontWeight: 'bold',
      fontSize: '14px',
      opacity: 0.5,
    };
  }

  return {
    padding: '10px 18px',
    backgroundColor: isActive ? activeColor : '#fff',
    color: isActive ? '#fff' : '#495057',
    border: `2px solid ${activeColor}`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    transition: 'all 0.2s',
  };
};