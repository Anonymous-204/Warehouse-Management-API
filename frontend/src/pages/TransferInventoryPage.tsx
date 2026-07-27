import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';

interface UserProfile {
  id: number;
  email: string;
  name?: string;
  role: 'STAFF' | 'MANAGER' | 'ADMIN';
  warehouseId?: number;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  price?: number;
}

interface InventoryItem {
  id?: number;
  quantity: number;
  costPrice?: number;
  productId?: number;
  product: Product;
}

interface Warehouse {
  id: number;
  name: string;
  code?: string;
}

export default function TransferInventoryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Đọc dữ liệu được truyền từ Modal ở HomePage (nếu có)
  const initialFromWarehouseId = location.state?.fromWarehouseId || '';
  const initialItem: InventoryItem | null = location.state?.item || null;

  // State Auth, Kho & Sản phẩm
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [productsInSource, setProductsInSource] = useState<InventoryItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // State Form Điều Chuyển
  const [fromWarehouseId, setFromWarehouseId] = useState<number | string>(initialFromWarehouseId);
  const [toWarehouseId, setToWarehouseId] = useState<number | string>('');
  const [productId, setProductId] = useState<number | string>(initialItem?.product?.id || initialItem?.productId || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>('');

  // State xử lý UI
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Lấy thông tin Profile & Danh sách tất cả các Kho
  useEffect(() => {
    const fetchProfileAndWarehouses = async () => {
      try {
        const profileRes = await api.get('/users/me');
        const userData: UserProfile = profileRes.data;
        setUser(userData);

        if (userData.role !== 'ADMIN') {
          setErrorMsg('Chỉ tài khoản ADMIN mới có quyền thực hiện điều chuyển kho!');
          return;
        }

        // Lấy danh sách kho
        try {
          const whRes = await api.get('/warehouses');
          setWarehouses(whRes.data);
        } catch (err) {
          console.warn('Không thể lấy danh sách kho từ API /warehouses');
        }

        // Mặc định chọn kho của User nếu chưa có kho nguồn từ location state
        if (!initialFromWarehouseId && userData.warehouseId) {
          setFromWarehouseId(userData.warehouseId);
        }
      } catch (err) {
        navigate('/login');
      } finally {
        setLoadingAuth(false);
      }
    };

    fetchProfileAndWarehouses();
  }, [navigate, initialFromWarehouseId]);

  // 2. Lấy danh sách Sản Phẩm theo Kho Xuất được chọn
  useEffect(() => {
    if (!fromWarehouseId) {
      setProductsInSource([]);
      return;
    }

    const fetchProductsByWarehouse = async () => {
      setLoadingProducts(true);
      try {
        // Thay đổi endpoint này phù hợp với API lấy danh sách tồn kho của bạn
        const res = await api.get(`/products/warehouse/${fromWarehouseId}`);
        const items: InventoryItem[] = res.data;
        setProductsInSource(items);

        // Nếu sản phẩm đang chọn không có trong kho xuất mới chọn -> Reset sản phẩm
        if (productId) {
          const exists = items.some(item => Number(item.product?.id || item.productId) === Number(productId));
          if (!exists && !initialItem) {
            setProductId('');
          }
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách sản phẩm trong kho nguồn:', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProductsByWarehouse();
  }, [fromWarehouseId]);

  // Tìm sản phẩm hiện tại được chọn trong danh sách để giới hạn max quantity
  const selectedInventory = productsInSource.find(
    (item) => Number(item.product?.id || item.productId) === Number(productId)
  ) || initialItem;

  // 3. Hàm Xử Lý Submit Điều Chuyển
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fromWarehouseId) {
      setErrorMsg('Vui lòng chọn Kho xuất!');
      return;
    }
    if (!toWarehouseId) {
      setErrorMsg('Vui lòng chọn Kho nhận!');
      return;
    }
    if (Number(fromWarehouseId) === Number(toWarehouseId)) {
      setErrorMsg('Kho xuất và Kho nhận không được trùng nhau!');
      return;
    }
    if (!productId) {
      setErrorMsg('Vui lòng chọn Sản phẩm cần điều chuyển!');
      return;
    }
    if (!quantity || quantity <= 0) {
      setErrorMsg('Số lượng điều chuyển phải lớn hơn 0!');
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/products/warehouse/${fromWarehouseId}/transfer`, {
        toWarehouseId: Number(toWarehouseId),
        productId: Number(productId),
        quantity: Number(quantity),
        note: note.trim() || undefined,
      });

      setSuccessMsg('🎉 Điều chuyển hàng thành công!');

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        const msg = err.response.data.message;
        setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        setErrorMsg('Đã xảy ra lỗi trong quá trình điều chuyển. Vui lòng thử lại!');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAuth) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Đang kiểm tra quyền truy cập...</div>;
  }

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#6f42c1' }}>🚚 Điều Chuyển Hàng Giữa Các Kho</h2>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '8px 14px',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ⬅️ Trang chủ
        </button>
      </div>

      {/* Kiểm tra Role */}
      {user && user.role !== 'ADMIN' ? (
        <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#842029', borderRadius: '6px' }}>
          🚫 <strong>Từ chối truy cập:</strong> Chức năng này yêu cầu quyền <strong>ADMIN</strong>.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={formCardStyle}>
          {/* Thông tin sản phẩm nhận từ Trang trước (nếu có) */}
          {initialItem && (
            <div style={{ padding: '12px', backgroundColor: '#e2d9f3', borderRadius: '6px', marginBottom: '20px', borderLeft: '4px solid #6f42c1' }}>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#41257b' }}>
                📦 {initialItem.product?.name}
              </div>
              <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
                Mã SKU: <code>{initialItem.product?.sku}</code> | Tồn kho hiện tại: <strong>{initialItem.quantity}</strong>
              </div>
            </div>
          )}

          {/* 1. Select Kho Xuất (From Warehouse) */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Kho xuất hàng (Kho nguồn) *</label>
            <select
              value={fromWarehouseId}
              onChange={(e) => {
                setFromWarehouseId(e.target.value);
                setProductId(''); // Reset sản phẩm khi đổi kho xuất
              }}
              required
              style={inputStyle}
            >
              <option value="">-- Chọn kho xuất --</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} {wh.code ? `(${wh.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Select Kho Nhận (To Warehouse) */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Kho nhận hàng (Kho đích) *</label>
            <select
              value={toWarehouseId}
              onChange={(e) => setToWarehouseId(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">-- Chọn kho nhận --</option>
              {warehouses.map((wh) => (
                <option
                  key={wh.id}
                  value={wh.id}
                  disabled={Number(wh.id) === Number(fromWarehouseId)}
                >
                  {wh.name} {wh.code ? `(${wh.code})` : ''} {Number(wh.id) === Number(fromWarehouseId) ? '(Đang chọn là Kho xuất)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Select Sản Phẩm (Hiển thị Tên Sản Phẩm) */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Sản phẩm điều chuyển *</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              disabled={!fromWarehouseId || loadingProducts}
              style={{ ...inputStyle, backgroundColor: !fromWarehouseId ? '#e9ecef' : '#fff' }}
            >
              <option value="">
                {!fromWarehouseId
                  ? '-- Vui lòng chọn Kho xuất trước --'
                  : loadingProducts
                  ? '⏳ Đang tải sản phẩm...'
                  : '-- Chọn sản phẩm cần chuyển --'}
              </option>
              {productsInSource.map((item) => {
                const pId = item.product?.id || item.productId;
                const pName = item.product?.name || `Sản phẩm #${pId}`;
                const pSku = item.product?.sku ? ` [${item.product.sku}]` : '';
                return (
                  <option key={pId} value={pId}>
                    {pName}{pSku} - (Tồn: {item.quantity})
                  </option>
                );
              })}
            </select>
          </div>

          {/* 4. Số Lượng Chuyển */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Số lượng điều chuyển * {selectedInventory ? `(Tối đa: ${selectedInventory.quantity})` : ''}
            </label>
            <input
              type="number"
              min="1"
              max={selectedInventory ? selectedInventory.quantity : undefined}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              required
              style={inputStyle}
            />
          </div>

          {/* 5. Ghi Chú */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Ghi chú điều chuyển</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Điều chuyển cân bằng kho chi nhánh..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Thông báo Lỗi / Thành công */}
          {errorMsg && (
            <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#842029', borderRadius: '4px', marginBottom: '15px' }}>
              ❌ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ padding: '10px', backgroundColor: '#d1e7dd', color: '#0f5132', borderRadius: '4px', marginBottom: '15px' }}>
              {successMsg}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{ padding: '10px 18px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6f42c1',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? '⏳ Đang xử lý...' : '🚀 Xóa / Chuyển Kho'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// Inline Styles
const formCardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '25px',
  borderRadius: '8px',
  border: '1px solid #dee2e6',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const formGroupStyle: React.CSSProperties = {
  marginBottom: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: '14px',
  color: '#333',
};

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '4px',
  border: '1px solid #ced4da',
  fontSize: '14px',
  outline: 'none',
};