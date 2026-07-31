import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';

// Kiểu dữ liệu nhận từ Router State
interface LocationState {
  warehouseId?: number;
  item?: {
    quantity: number;
    costPrice: number;
    supplier?: { name: string };
    product: {
      id: number;
      sku: string;
      name: string;
      price: number;
    };
  };
}

export default function AdjustPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy thông tin từ State
  const state = location.state as LocationState | null;
  const item = state?.item;
  const warehouseId = state?.warehouseId;

  // Form states - Khởi tạo từ giá trị item an toàn
  const [actualQuantity, setActualQuantity] = useState<number>(item?.quantity ?? 0);
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Kiểm tra điều kiện đầu vào nếu truy cập trực tiếp
  if (!item || !warehouseId || !item.product?.id) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
        <h3>⚠️ Thiếu thông tin sản phẩm hoặc kho</h3>
        <p>Vui lòng quay lại Trang chủ và chọn sản phẩm cần điều chỉnh.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0d6efd',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ⬅️ Quay về Trang chủ
        </button>
      </div>
    );
  }

  // Tính chênh lệch (Variance)
  const systemQuantity = item.quantity;
  const variance = actualQuantity - systemQuantity;

  // 2. Xử lý gửi Form điều chỉnh
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (actualQuantity < 0) {
      setMessage({ type: 'error', text: 'Số lượng thực tế không được là số âm!' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      // ✅ SỬA LỖI API: Truyền đầy đủ warehouseId, productId, quantity (mới) và note
      await api.put(`/products/inventory/adjust`, {
        warehouseId: Number(warehouseId),
        productId: Number(item.product.id),
        quantity: Number(actualQuantity),
        note: note.trim() || 'Điều chỉnh kiểm kê tồn kho',
      });

      setMessage({
        type: 'success',
        text: `Đã cập nhật tồn kho mới thành công: ${actualQuantity} sản phẩm!`,
      });

      // Chuyển hướng sau khi thành công
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      console.error('Adjust inventory error:', err);
      const errDetail = err.response?.data?.message || 'Có lỗi xảy ra khi điều chỉnh tồn kho!';
      setMessage({ type: 'error', text: Array.isArray(errDetail) ? errDetail.join(', ') : errDetail });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>📝 Điều Chỉnh Tồn Kho (Kiểm Kê)</h2>
        <button
          onClick={() => navigate('/')}
          style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          ⬅️ Quay về Trang chủ
        </button>
      </div>

      {/* Card thông tin sản phẩm */}
      <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', border: '1px solid #ffe69c', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#664d03' }}>📌 Thông tin kiểm kê</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
          <div><strong>Sản phẩm:</strong> {item.product.name}</div>
          <div><strong>Mã SKU:</strong> <code>{item.product.sku}</code></div>
          <div><strong>Nhà cung cấp:</strong> {item.supplier?.name || 'N/A'}</div>
          <div><strong>Mã kho:</strong> {warehouseId}</div>
          <div style={{ gridColumn: 'span 2', marginTop: '5px' }}>
            <strong>Tồn kho trên hệ thống:</strong>{' '}
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0d6efd' }}>{systemQuantity}</span>
          </div>
        </div>
      </div>

      {/* Thông báo */}
      {message && (
        <div
          style={{
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '15px',
            backgroundColor: message.type === 'success' ? '#d1e7dd' : '#f8d7da',
            color: message.type === 'success' ? '#0f5132' : '#842029',
            border: `1px solid ${message.type === 'success' ? '#badbcc' : '#f5c2c7'}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Form nhập liệu */}
      <form onSubmit={handleSubmit} style={{ border: '1px solid #dee2e6', padding: '20px', borderRadius: '8px', backgroundColor: '#fff' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
            Số lượng thực tế đếm được (Số lượng mới):
          </label>
          <input
            type="number"
            min="0"
            value={actualQuantity}
            onChange={(e) => setActualQuantity(parseInt(e.target.value, 10) || 0)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '16px', fontWeight: 'bold', boxSizing: 'border-box' }}
          />
        </div>

        {/* Khối chênh lệch (Variance) */}
        <div
          style={{
            padding: '12px 15px',
            borderRadius: '6px',
            marginBottom: '15px',
            backgroundColor: variance === 0 ? '#f8f9fa' : variance > 0 ? '#d1e7dd' : '#f8d7da',
            border: `1px solid ${variance === 0 ? '#dee2e6' : variance > 0 ? '#badbcc' : '#f5c2c7'}`,
            fontSize: '14px',
          }}
        >
          <strong>Chênh lệch tồn kho:</strong>{' '}
          <span style={{ fontWeight: 'bold', color: variance === 0 ? '#6c757d' : variance > 0 ? '#198754' : '#dc3545' }}>
            {variance > 0 ? `+${variance}` : variance}
          </span>{' '}
          {variance === 0 && '(Số lượng không đổi)'}
          {variance > 0 && '(Thừa kho - Hệ thống sẽ tự cộng thêm)'}
          {variance < 0 && '(Hao hụt/Mất mát - Hệ thống sẽ tự trừ đi)'}
        </div>

        {/* Ghi chú */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Lý do điều chỉnh / Kiểm kê:</label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Lệch sổ sách sau đợt kiểm kê hàng tháng, hàng hư hỏng bị hủy,..."
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#fd7e14',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? '⏳ Đang lưu...' : '💾 Xác nhận điều chỉnh kho'}
        </button>
      </form>
    </div>
  );
}