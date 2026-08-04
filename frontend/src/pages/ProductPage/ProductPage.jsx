import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../../Auth'; // 🟢 Import đúng ngoặc nhọn { api }

const ProductPage = () => {
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchProduct = async () => {
            try {
                const res = await api.get(`products/warehouse/${user.warehouseId}`);
                if (isMounted) setProduct(res.data);
            } 
            catch (err) {
                console.error('Lỗi khi tải dữ liệu sản phẩm:', err);
                if (isMounted) setError('Không thể tải dữ liệu sản phẩm từ Server!');
            }
            finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchProduct();

        return () => {
            isMounted = false;
        };
    }, []);
    return (
        <div>
            <div>Danh sách sản phẩm</div>
            {loading && <p>Đang tải...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <table>
                    <thead>
                        <th>
                            
                            <tr>SKU</tr>
                            <tr>Tên sản phẩm</tr>
                            <tr>Giá</tr>
                            <tr>Số lương</tr>
                            <tr>Danh mục</tr>
                            <tr>Hãng</tr>
                            <tr>Nhà cung cấp</tr>
                        </th>
                    </thead>
                    <tbody>
                    {product && product.map((item) => (
                        <tr key={item.id}>
                            <td>{item.sku}</td>
                            <td>{item.name}</td>
                            <td>{item.price}</td>
                            <td>{item.quantity}</td>
                            <td>{item.category}</td>
                            <td>{item.brand}</td>
                            <td>{item.supplier}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export default ProductPage;