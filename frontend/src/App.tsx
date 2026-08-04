import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import './App.css';
import { ProtectedRoute, AuthProvider } from './Auth';
import HomePage from './pages/HomePage/HomePage';
import MainLayout from './layouts/MainLayout';
import ProductPage from './pages/ProductPage/ProductPage';
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Đường dẫn /login -> Trang Đăng nhập */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Đường dẫn / -> Trang chủ */}
          <Route  element={<ProtectedRoute><MainLayout/></ProtectedRoute>} >
            <Route path="/" element={<HomePage/>} />
            <Route path="/products" element={<ProductPage/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}