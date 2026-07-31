import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import './App.css';
import { ProtectedRoute, AuthProvider } from './Auth';
import HomePage from './pages/HomePage/HomePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Đường dẫn /login -> Trang Đăng nhập */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Đường dẫn / -> Trang chủ */}
          <Route path="/" element={<ProtectedRoute><HomePage/></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}