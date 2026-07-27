import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';

// Interface nhận dữ liệu từ HomePage
interface LocationState {
  warehouseId?: number;
  item?: {
    quantity: number;
    costPrice: number;
    supplier: { name: string };
    product: {
      id: number;
      sku: string;
      name: string;
      price: number;
    };
  };
}

export default function ImportExportPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy dữ liệu sản phẩm & kho từ React Router State
  const state = location.state as LocationState;
  const item = state?.item;
  const warehouseId = state?.warehouseId;

  // Form states
  const [type, setType] = useState<'IMPORT' | 'EXPORT'>('IMPORT');
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Màn hình báo lỗi nếu truy cập thiếu State
  if (!item || !warehouseId || !item.product?.id) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
        <h3>⚠️ Thiếu thông tin sản phẩm hoặc kho</h3>
        <p>Vui lòng quay lại Trang chủ và chọn sản phẩm từ danh sách.</p>
        <button
          onClick={() => navigate('/')}
          style={{ padding: '8px 16px', backgroundColor: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          ⬅️ Quay về Trang chủ
        </button>
      </div>
    );
  }

  // Xử lý gửi form Nhập / Xuất
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity <= 0) {
      setMessage({ type: 'error', text: 'Số lượng phải lớn hơn 0!' });
      return;
    }

    if (type === 'EXPORT' && quantity > item.quantity) {
      setMessage({ type: 'error', text: `Số lượng xuất (${quantity}) vượt quá tồn kho hiện tại (${item.quantity})!` });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    // 🎯 ĐỔI DẤU QUANTITY TẠI ĐÂY:
    // - Nếu là IMPORT: giữ nguyên số dương (+quantity)
    // - Nếu là EXPORT: đổi thành số âm (-quantity) để Backend xử lý
    const payloadQuantity = type === 'IMPORT' ? Number(quantity) : -Math.abs(Number(quantity));

    try {
      // API NestJS: PUT /products/inventory/io
      await api.put('/products/inventory/io', {
        warehouseId: Number(warehouseId),
        productId: Number(item.product.id),
        quantity: payloadQuantity, // 👈 Đã đổi dấu âm/dương phù hợp với Service
        note: note.trim() || undefined,
      });

      setMessage({
        type: 'success',
        text: `Đã ${type === 'IMPORT' ? 'nhập' : 'xuất'} thành công ${quantity} sản phẩm!`
      });

      // Tự động chuyển về trang chủ sau 1.5 giây
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (err: any) {
      console.error(err);
      const errDetail = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tồn kho!';
      setMessage({ type: 'error', text: Array.isArray(errDetail) ? errDetail.join(', ') : errDetail });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>📦 Tạo Phiếu Xuất / Nhập Kho</h2>
        <button
          onClick={() => navigate('/')}
          style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          ⬅️ Sơ đồ kho
        </button>
      </div>

      {/* Thông tin sản phẩm chọn */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#0d6efd' }}>Thông tin sản phẩm chọn</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
          <div><strong>Tên sản phẩm:</strong> {item.product.name}</div>
          <div><strong>Mã SKU:</strong> <code>{item.product.sku}</code></div>
          <div><strong>Nhà cung cấp:</strong> {item.supplier?.name || 'N/A'}</div>
          <div><strong>Tồn kho hiện tại:</strong> <span style={{ color: '#198754', fontWeight: 'bold' }}>{item.quantity}</span></div>
        </div>
      </div>

      {/* Thông báo kết quả */}
      {message && (
        <div style={{
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '15px',
          backgroundColor: message.type === 'success' ? '#d1e7dd' : '#f8d7da',
          color: message.type === 'success' ? '#0f5132' : '#842029',
          border: `1px solid ${message.type === 'success' ? '#badbcc' : '#f5c2c7'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Form nhập liệu */}
      <form onSubmit={handleSubmit} style={{ border: '1px solid #dee2e6', padding: '20px', borderRadius: '8px', backgroundColor: '#fff' }}>

        {/* Chọn loại giao dịch */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Loại giao dịch:</label>
          <div style={{ display: 'flex', gap: '20px' }}>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="radio"
                name="type"
                value="IMPORT"
                checked={type === 'IMPORT'}
                onChange={() => setType('IMPORT')}
              />
              <span style={{ color: '#198754', fontWeight: 'bold' }}>📥 Nhập kho (+)</span>
            </label>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="radio"
                name="type"
                value="EXPORT"
                checked={type === 'EXPORT'}
                onChange={() => setType('EXPORT')}
              />
              <span style={{ color: '#dc3545', fontWeight: 'bold' }}>📤 Xuất kho (-)</span>
            </label>
          </div>
        </div>

        {/* Số lượng */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
            Số lượng {type === 'IMPORT' ? 'nhập' : 'xuất'}:
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '15px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Ghi chú */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Ghi chú / Lý do:</label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Nhập hàng từ NCC, Xuất bán cho khách hàng A,..."
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Nút Submit */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '10px 20px',
              backgroundColor: type === 'IMPORT' ? '#198754' : '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {submitting ? '⏳ Đang xử lý...' : type === 'IMPORT' ? '📥 Xác nhận Nhập kho' : '📤 Xác nhận Xuất kho'}
          </button>
        </div>

      </form>
    </div>
  );
}