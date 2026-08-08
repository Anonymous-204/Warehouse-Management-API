import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import './App.css';
import { ProtectedRoute, AuthProvider } from './Auth';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import InventoryPage from './pages/InventoryPage';
import WarehousePage from './pages/WarehousePage';
import SupplierPage from './pages/SupplierPage';
import EmployeePage from './pages/EmployeePage';
import ProductsPage from './pages/ProductsPage';
import HistoryPage from './pages/HistoryPage';
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
            <Route path="/inventory" element={<InventoryPage/>} />
            <Route path="/warehouse" element={<WarehousePage/>} />
            <Route path="/suppliers" element={<SupplierPage/>} />
            <Route path="/employees" element={<EmployeePage/>} />
            <Route path="/products" element={<ProductsPage/>} />
            <Route path="/history" element={<HistoryPage/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}