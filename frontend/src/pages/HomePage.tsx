import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

// 1. Khai báo kiểu dữ liệu cho User
interface UserProfile {
  id: number;
  email: string;
  name?: string;
  role: 'STAFF' | 'MANAGER' | 'ADMIN';
  warehouseId?: number;
}

// 2. Khai báo kiểu dữ liệu cho Sản phẩm tồn kho
interface InventoryItem {
  quantity: number;
  costPrice: number;
  supplier: {
    name: string;
  };
  product: {
    id?: number;
    sku: string;
    name: string;
    description?: string;
    price: number;
    category: { name: string };
    brand: { name: string };
  };
}

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // State quản lý danh sách sản phẩm & trạng thái tải sản phẩm
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // State quản lý Modal khi bấm vào dòng sản phẩm
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const navigate = useNavigate();

  // Tự động kiểm tra Cookie Auth khi vừa vào Trang chủ
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

  // Hàm gọi API lấy danh sách sản phẩm
  const fetchWarehouseProducts = async () => {
    if (!user?.warehouseId) {
      setErrorMsg('Tài khoản của bạn chưa được gán vào bất kỳ kho nào!');
      return;
    }

    setLoadingProducts(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/products/warehouse/${user.warehouseId}`);
      setProducts(res.data);
      setShowProducts(true);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setErrorMsg('Bạn không có quyền truy cập dữ liệu của kho này!');
      } else {
        setErrorMsg('Không thể lấy danh sách sản phẩm. Vui lòng thử lại!');
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  // Hàm Đăng xuất
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error(err);
    } finally {
      navigate('/login');
    }
  };

  // Logic kiểm tra phân quyền nút bấm theo Role
  const isAllowed = (action: 'IMPORT_EXPORT' | 'ADJUST' | 'TRANSFER') => {
    if (!user) return false;
    const role = user.role;

    if (action === 'IMPORT_EXPORT') {
      return ['STAFF', 'MANAGER', 'ADMIN'].includes(role);
    }
    if (action === 'ADJUST') {
      return ['MANAGER', 'ADMIN'].includes(role);
    }
    if (action === 'TRANSFER') {
      // Phân quyền cho phép chuyển kho (ở đây giữ theo logic cũ của bạn: ADMIN)
      return role === 'ADMIN';
    }
    return false;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Đang xác thực thông tin...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      {/* Header Trang chủ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '15px 20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        <div>
          <h3 style={{ margin: 0 }}>🏠 Trang Chủ Quản Lý Kho</h3>
          {user && (
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6c757d' }}>
              Xin chào: <strong>{user.name || user.email}</strong> | Quyền: <span style={{ color: '#0d6efd', fontWeight: 'bold' }}>{user.role}</span>
              {user.warehouseId && <span> | Mã kho: <strong>{user.warehouseId}</strong></span>}
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Đăng xuất
        </button>
      </div>

      {/* Khu vực nút chức năng */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={fetchWarehouseProducts}
          disabled={loadingProducts}
          style={{
            padding: '12px 20px',
            backgroundColor: '#198754',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {loadingProducts ? '⏳ Đang tải dữ liệu...' : '📦 Xem toàn bộ sản phẩm trong kho'}
        </button>

        {/* NÚT CHUYỂN HƯỚNG TỚI TRANG LỊCH SỬ CÁ NHÂN */}
        <button
          onClick={() => navigate('/history/me')}
          style={{
            padding: '12px 20px',
            backgroundColor: '#0d6efd',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📜 Lịch sử hoạt động
        </button>
      </div>

      {/* Thông báo lỗi nếu có */}
      {errorMsg && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8d7da', color: '#842029', borderRadius: '4px' }}>
          {errorMsg}
        </div>
      )}

      {/* Bảng hiển thị danh sách sản phẩm */}
      {showProducts && (
        <div style={{ marginTop: '25px' }}>
          <h4 style={{ marginBottom: '5px' }}>
            📋 Danh sách sản phẩm tồn kho (Tổng: {products.length} mặt hàng)
          </h4>
          <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#6c757d' }}>
            💡 <em>Click vào một dòng sản phẩm để thực hiện các thao tác kho.</em>
          </p>

          {products.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: '#6c757d' }}>Kho này hiện chưa có sản phẩm nào.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0d6efd', color: '#fff' }}>
                    <th style={thStyle}>SKU</th>
                    <th style={thStyle}>Tên sản phẩm</th>
                    <th style={thStyle}>Thương hiệu</th>
                    <th style={thStyle}>Danh mục</th>
                    <th style={thStyle}>Nhà cung cấp</th>
                    <th style={thStyle}>Tồn kho</th>
                    <th style={thStyle}>Giá vốn</th>
                    <th style={thStyle}>Giá bán</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item, index) => (
                    <tr
                      key={index}
                      onClick={() => setSelectedItem(item)}
                      style={{
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e9ecef')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f8f9fa')}
                    >
                      <td style={tdStyle}><code>{item.product.sku}</code></td>
                      <td style={tdStyle}><strong>{item.product.name}</strong></td>
                      <td style={tdStyle}>{item.product.brand?.name}</td>
                      <td style={tdStyle}>{item.product.category?.name}</td>
                      <td style={tdStyle}>{item.supplier?.name}</td>
                      <td style={{ ...tdStyle, fontWeight: 'bold', color: item.quantity > 0 ? '#198754' : '#dc3545' }}>
                        {item.quantity}
                      </td>
                      <td style={tdStyle}>{item.costPrice?.toLocaleString()} đ</td>
                      <td style={tdStyle}>{item.product.price?.toLocaleString()} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* -------------------- MODAL THAO TÁC SẢN PHẨM -------------------- */}
      {selectedItem && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dee2e6', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>⚙️ Thao tác sản phẩm</h3>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6c757d' }}
              >
                ✖
              </button>
            </div>

            <div style={{ margin: '15px 0', fontSize: '14px', lineHeight: '1.6' }}>
              <p style={{ margin: '4px 0' }}><strong>Sản phẩm:</strong> {selectedItem.product.name}</p>
              <p style={{ margin: '4px 0' }}><strong>Mã SKU:</strong> <code>{selectedItem.product.sku}</code></p>
              <p style={{ margin: '4px 0' }}><strong>Tồn kho hiện tại:</strong> <span style={{ color: '#198754', fontWeight: 'bold' }}>{selectedItem.quantity}</span></p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              {/* Option 1: Xuất / Nhập Kho (STAFF, MANAGER, ADMIN) */}
              <button
                disabled={!isAllowed('IMPORT_EXPORT')}
                onClick={() => {
                  navigate('/inventory/import-export', {
                    state: {
                      warehouseId: user?.warehouseId,
                      item: selectedItem
                    }
                  });
                }}
                style={getButtonStyle(isAllowed('IMPORT_EXPORT'), '#0d6efd')}
                title={!isAllowed('IMPORT_EXPORT') ? 'Bạn không có quyền thực hiện' : ''}
              >
                📦 Xuất / Nhập kho
              </button>

              {/* Option 2: Điều chỉnh kho (MANAGER, ADMIN) */}
              <button
                disabled={!isAllowed('ADJUST')}
                onClick={() => {
                  navigate('/inventory/adjust', {
                    state: {
                      warehouseId: user?.warehouseId,
                      item: selectedItem
                    }
                  });
                }}
                style={getButtonStyle(isAllowed('ADJUST'), '#fd7e14')}
                title={!isAllowed('ADJUST') ? 'Yêu cầu quyền MANAGER hoặc ADMIN' : ''}
              >
                📝 Điều chỉnh tồn kho (Kiểm kê / Lệch kho)
              </button>

              {/* Option 3: Điều chuyển hàng (Chỉ ADMIN) */}
              <button
                disabled={!isAllowed('TRANSFER')}
                onClick={() => {
                  navigate('/inventory/transfer', {
                    state: {
                      fromWarehouseId: user?.warehouseId,
                      item: selectedItem
                    }
                  });
                }}
                style={getButtonStyle(isAllowed('TRANSFER'), '#6f42c1')}
                title={!isAllowed('TRANSFER') ? 'Chỉ ADMIN mới có quyền điều chuyển giữa các kho' : ''}
              >
                🚚 Điều chuyển hàng sang kho khác
              </button>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thông tin User thô (Debug) */}
      <div style={{ marginTop: '40px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa' }}>
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#6c757d' }}>🔍 Xem JSON Auth Profile (Debug)</summary>
          <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '4px', marginTop: '10px', overflowX: 'auto' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

// Style hỗ trợ cho Table & Modal
const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #343a40',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '20px 25px',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '450px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
};

// Helper tạo Style linh hoạt cho nút active/disabled
const getButtonStyle = (active: boolean, color: string): React.CSSProperties => ({
  padding: '12px 16px',
  backgroundColor: active ? color : '#e9ecef',
  color: active ? '#fff' : '#adb5bd',
  border: active ? 'none' : '1px solid #ced4da',
  borderRadius: '6px',
  cursor: active ? 'pointer' : 'not-allowed',
  fontWeight: 'bold',
  fontSize: '14px',
  textAlign: 'left',
  opacity: active ? 1 : 0.6,
  transition: 'all 0.2s',
});