import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ImportExportPage from './pages/ImportExportPage';
import UserHistoryPage from './pages/UserHistoryPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdjustPage from './pages/AdjustPage';
import './App.css';
import TransferInventoryPage from './pages/TransferInventoryPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn /login -> Trang Đăng nhập */}
        <Route path="/login" element={<LoginPage />} />

        {/* Đường dẫn / -> Trang chủ */}
        <Route path="/" element={<HomePage />} />
        <Route path="/inventory/import-export" element={<ImportExportPage />} />
        <Route path="/history/me" element={<UserHistoryPage />} />
        <Route path="/inventory/adjust" element={<AdjustPage />}/>
        <Route path="/inventory/transfer" element={<TransferInventoryPage />}/>
      </Routes>
    </BrowserRouter>
  );
}