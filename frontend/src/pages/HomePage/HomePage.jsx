// src/pages/HomePage/HomePage.jsx
import React from 'react';
import { useAuth } from '../../Auth';

const HomePage = () => {
  // 🟢 Lấy trực tiếp user và logout từ Context
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Màn Hình Debug API (/users/me)</h1>

      {!user ? (
        <div style={{ padding: '15px', background: '#ffe6e6', color: '#cc0000', borderRadius: '6px' }}>
          <h3>❌ Không tìm thấy thông tin người dùng!</h3>
        </div>
      ) : (
        <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px' }}>
          <h2>✅ Kết quả trả về:</h2>
          
          <div style={{ marginBottom: '15px', fontSize: '18px' }}>
            <p>👤 <strong>Name:</strong> {user?.name || 'Không có'}</p>
            <p>🏭 <strong>Warehouse ID:</strong> {user?.warehouseId ?? 'null'}</p>
          </div>

          <hr />

          <p><strong>Raw JSON Response:</strong></p>
          <pre style={{ background: '#222', color: '#00ff00', padding: '15px', borderRadius: '5px', overflowX: 'auto' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={logout} 
          style={{ padding: '10px 15px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default HomePage;