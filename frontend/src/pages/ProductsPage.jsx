import { useEffect, useState } from 'react';
import { useAuth, api } from '../Auth';

const ProductsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // State lưu danh mục & thương hiệu dùng cho form tạo
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // State lưu thông tin Form tạo sản phẩm
  const [formData, setFormData] = useState({
    sku: '',
    productName: '',
    price: '',
    categoryId: '',
    brandId: '',
    description: '',
    image: '',
  });

  // Lấy danh sách toàn bộ sản phẩm (tương ứng hàm getAllProduct backend)
  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Gọi endpoint lấy danh sách toàn bộ sản phẩm
      const res = await api.get('products');
      setProducts(res.data || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu sản phẩm:', err);
      setError(
        err.response?.data?.message || 'Không thể tải dữ liệu sản phẩm từ Server!'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Mở modal và gọi API lấy thông tin Brand & Category
  const handleGetBrandAndCategory = async () => {
    try {
      const info = await api.get('/products/getbrandandcategory');
      const data = info.data?.data || info.data;

      setCategories(data.categories || []);
      setBrands(data.brands || []);
      setShowCreateForm(true);
    } catch (err) {
      console.error('Lỗi lấy Brand & Category:', err);
      alert('Không thể tải danh sách thương hiệu và danh mục!');
    }
  };

  // Submit Form Tạo Sản Phẩm
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/products/createProduct', {
        sku: formData.sku,
        name: formData.productName || 'Chưa đặt tên',
        price: Number(formData.price) || 0,
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        description: formData.description || 'Mô tả sản phẩm',
        image: formData.image || '',
      });

      alert('Tạo sản phẩm thành công!');

      // Cập nhật lại UI realtime bằng cách lấy mới hoặc push dữ liệu
      if (res.data) {
        const newProduct = res.data.product || res.data;
        // Format theo cấu trúc getAllProduct trả về
        setProducts((prev) => [
          {
            Id: newProduct.id,
            sku: newProduct.sku,
            name: newProduct.name,
            price: newProduct.price,
            image: newProduct.image || formData.image,
            category: newProduct.category?.name || renderValue(newProduct.category),
            brand: newProduct.brand?.name || renderValue(newProduct.brand),
          },
          ...prev,
        ]);
      }

      // Reset form & đóng modal
      setFormData({
        sku: '',
        productName: '',
        price: '',
        categoryId: '',
        brandId: '',
        description: '',
        image: '',
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Lỗi tạo sản phẩm:', err);
      alert(err.response?.data?.message || 'Tạo sản phẩm thất bại!');
    }
  };

  // Helper định dạng tiền VNĐ
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Helper hiển thị giá trị chuỗi/object an toàn
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
          <p style={styles.subtitle}>Quản lý toàn bộ danh mục sản phẩm hệ thống</p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
          <button style={styles.addButton} onClick={handleGetBrandAndCategory}>
            ➕ Thêm sản phẩm
          </button>
        )}
      </div>

      {/* Hiển thị Loading / Error */}
      {loading && <div style={styles.loadingBox}>⏳ Đang tải dữ liệu sản phẩm...</div>}
      {error && <div style={styles.errorBox}>⚠️ {error}</div>}

      {/* Form Modal tạo sản phẩm */}
      {showCreateForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>✨ Thêm sản phẩm mới</h2>
              <button style={styles.closeButton} onClick={() => setShowCreateForm(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="sku">SKU</label>
                <input
                  style={styles.input}
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Nhập mã SKU (để trống nếu tự tạo)"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="productName">Tên sản phẩm *</label>
                <input
                  style={styles.input}
                  type="text"
                  id="productName"
                  required
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="price">Giá bán (VNĐ) *</label>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  id="price"
                  required
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Nhập giá"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="category">Danh mục *</label>
                <select
                  style={styles.input}
                  id="category"
                  required
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="brand">Thương hiệu</label>
                <select
                  style={styles.input}
                  id="brand"
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn thương hiệu --</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="description">Mô tả</label>
                <input
                  style={styles.input}
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="image">URL Ảnh sản phẩm</label>
                <input
                  style={styles.input}
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="Nhập link ảnh (https://...)"
                />
                {/* Xem trước ảnh nếu có điền link */}
                {formData.image && (
                  <div style={styles.imagePreviewContainer}>
                    <span style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', display: 'block' }}>
                      Xem trước ảnh:
                    </span>
                    <img
                      src={formData.image}
                      alt="Preview"
                      style={styles.imagePreviewModal}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setShowCreateForm(false)}
                >
                  Hủy
                </button>
                <button type="submit" style={styles.submitButton}>
                  Lưu sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bảng dữ liệu hiển thị khi đã load xong */}
      {!loading && !error && (
        <div style={styles.tableCard}>
          {products && products.length > 0 ? (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Hình ảnh</th>
                    <th style={styles.th}>SKU</th>
                    <th style={styles.th}>Tên sản phẩm</th>
                    <th style={styles.th}>Giá bán</th>
                    <th style={styles.th}>Danh mục</th>
                    <th style={styles.th}>Hãng</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.Id || item.id || item.sku} style={styles.tr}>
                      {/* Cột hình ảnh sản phẩm */}
                      <td style={styles.td}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={styles.productThumb}
                            onError={(e) => {
                              // Tự động chuyển về icon thay thế nếu URL ảnh hỏng
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          style={{
                            ...styles.imagePlaceholder,
                            display: item.image ? 'none' : 'flex',
                          }}
                        >
                          📦
                        </div>
                      </td>
                      <td style={{ ...styles.td, fontWeight: '600', color: '#2563EB' }}>
                        {item.sku || '---'}
                      </td>
                      <td style={{ ...styles.td, fontWeight: '500', color: '#111827' }}>
                        {item.name}
                      </td>
                      <td style={{ ...styles.td, color: '#16A34A', fontWeight: '600' }}>
                        {formatVND(item.price)}
                      </td>
                      <td style={styles.td}>{renderValue(item.category)}</td>
                      <td style={styles.td}>{renderValue(item.brand)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.emptyBox}>📭 Chưa có sản phẩm nào.</div>
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
  addButton: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
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
    padding: '12px 16px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  productThumb: {
    width: '48px',
    height: '48px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    display: 'block',
  },
  imagePlaceholder: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    border: '1px solid #E2E8F0',
  },
  imagePreviewContainer: {
    marginTop: '8px',
  },
  imagePreviewModal: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
  },
  emptyBox: {
    padding: '40px',
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: '15px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    justify: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: '24px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },
  modalHeader: {
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#64748B',
  },
  formGroup: {
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    justify: 'flex-end',
    gap: '12px',
    marginTop: '20px',
  },
  cancelButton: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default ProductsPage;