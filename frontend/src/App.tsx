import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ImportExportPage from './pages/ImportExportPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn /login -> Trang Đăng nhập */}
        <Route path="/login" element={<LoginPage />} />

        {/* Đường dẫn / -> Trang chủ */}
        <Route path="/" element={<HomePage />} />
        <Route path="/inventory/import-export" element={<ImportExportPage />} />
      </Routes>
    </BrowserRouter>
  );
}