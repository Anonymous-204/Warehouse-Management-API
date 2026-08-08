import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth, api } from "../Auth";

// --- CSS STYLES ---
const styles = `
  .history-container {
    max-width: 1000px;
    margin: 20px auto;
    padding: 24px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .history-header {
    margin-bottom: 20px;
    color: #1a202c;
    font-size: 24px;
    font-weight: 700;
  }

  .tab-group {
    display: flex;
    gap: 10px;
    margin-bottom: 24px;
    border-bottom: 2px solid #edf2f7;
    padding-bottom: 8px;
  }

  .tab-btn {
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    color: #4a5568;
    background-color: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    outline: none;
  }

  .tab-btn:hover {
    background-color: #edf2f7;
    color: #2d3748;
  }

  .tab-btn.active {
    background-color: #3182ce;
    color: #ffffff;
    border-color: #3182ce;
    box-shadow: 0 2px 8px rgba(49, 130, 206, 0.3);
  }

  .tab-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .custom-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  .custom-table th {
    background-color: #f7fafc;
    color: #4a5568;
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e2e8f0;
  }

  .custom-table td {
    padding: 14px 16px;
    color: #2d3748;
    font-size: 14px;
    border-bottom: 1px solid #edf2f7;
  }

  .custom-table tbody tr:hover {
    background-color: #f8fafc;
  }

  .qty-in { color: #2f855a; font-weight: 600; }
  .qty-out { color: #c53030; font-weight: 600; }

  .state-msg {
    padding: 40px;
    text-align: center;
    color: #718096;
    font-size: 15px;
  }

  .state-msg.error { color: #e53e3e; }

  .retry-btn {
    margin-top: 12px;
    padding: 6px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #ffffff;
    background-color: #3182ce;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
`;

// Inject the stylesheet once instead of re-creating a <style> node on every render
let stylesInjected = false;
function useInjectStylesOnce(css) {
  useEffect(() => {
    if (stylesInjected) return;
    const tag = document.createElement("style");
    tag.setAttribute("data-history-page", "true");
    tag.textContent = css;
    document.head.appendChild(tag);
    stylesInjected = true;
  }, [css]);
}

const formatDate = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "-";

// --- Config-driven columns per tab (single generic table instead of 3 near-duplicate ones) ---
const TAB_CONFIG = {
  io: {
    label: "Nhập / Xuất",
    endpoint: "history/io",
    columns: [
      { key: "product", header: "Sản phẩm", render: (r) => r.product?.name || "-" },
      { key: "warehouse", header: "Kho", render: (r) => r.fromWarehouse?.name || "-" },
      {
        key: "direction",
        header: "Loại",
        render: (r) => (r.type === "out" ? "Xuất" : "Nhập"),
      },
      {
        key: "quantity",
        header: "Số lượng",
        render: (r) => (
          <span className={r.type === "out" ? "qty-out" : "qty-in"}>
            {r.type === "out" ? "-" : "+"}
            {r.quantity}
          </span>
        ),
      },
      { key: "user", header: "Người thực hiện", render: (r) => r.user?.name || "-" },
      { key: "createdAt", header: "Thời gian", render: (r) => formatDate(r.createdAt) },
    ],
  },
  adjust: {
    label: "Điều chỉnh",
    endpoint: "history/adjust",
    columns: [
      { key: "product", header: "Sản phẩm", render: (r) => r.product?.name || "-" },
      { key: "warehouse", header: "Kho", render: (r) => r.fromWarehouse?.name || "-" },
      {
        key: "quantity",
        header: "Thay đổi",
        render: (r) => (
          <span className={r.quantity < 0 ? "qty-out" : "qty-in"}>
            {r.quantity > 0 ? "+" : ""}
            {r.quantity}
          </span>
        ),
      },
      { key: "note", header: "Lý do", render: (r) => r.note || "-" },
      { key: "user", header: "Người thực hiện", render: (r) => r.user?.name || "-" },
      { key: "createdAt", header: "Thời gian", render: (r) => formatDate(r.createdAt) },
    ],
  },
  transfer: {
    label: "Chuyển kho",
    endpoint: "history/transfer",
    columns: [
      { key: "product", header: "Sản phẩm", render: (r) => r.product?.name || "-" },
      { key: "from", header: "Kho đi", render: (r) => r.fromWarehouse?.name || "-" },
      { key: "to", header: "Kho đến", render: (r) => r.toWarehouse?.name || "-" },
      { key: "quantity", header: "Số lượng", render: (r) => r.quantity },
      { key: "user", header: "Người thực hiện", render: (r) => r.user?.name || "-" },
      { key: "createdAt", header: "Thời gian", render: (r) => formatDate(r.createdAt) },
    ],
  },
};

const HistoryTable = ({ columns, rows }) => (
  <table className="custom-table">
    <thead>
      <tr>
        {columns.map((col) => (
          <th key={col.key}>{col.header}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <tr key={row.id}>
          {columns.map((col) => (
            <td key={col.key}>{col.render(row)}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const HistoryPage = () => {
  const { user } = useAuth();
  const [type, setType] = useState("io");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useInjectStylesOnce(styles);

  const fetchHistory = useCallback(async (currentType, signal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(TAB_CONFIG[currentType].endpoint, { signal });
      setHistory(res.data || []);
    } catch (err) {
      if (err?.name === "CanceledError" || err?.name === "AbortError") return;
      console.error(err);
      setError("Không thể tải dữ liệu lịch sử. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchHistory(type, controller.signal);
    return () => controller.abort();
  }, [type, reloadKey, fetchHistory]);

  const activeColumns = useMemo(() => TAB_CONFIG[type].columns, [type]);

  const renderContent = () => {
    if (loading) return <div className="state-msg">Đang tải dữ liệu...</div>;
    if (error)
      return (
        <div className="state-msg error">
          {error}
          <div>
            <button className="retry-btn" onClick={() => setReloadKey((k) => k + 1)}>
              Thử lại
            </button>
          </div>
        </div>
      );
    if (!history.length)
      return <div className="state-msg">Chưa có lịch sử giao dịch nào.</div>;

    return <HistoryTable columns={activeColumns} rows={history} />;
  };

  return (
    <div className="history-container">
      <h2 className="history-header">Lịch sử kho hàng</h2>

      <div className="tab-group">
        {Object.entries(TAB_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            className={`tab-btn ${type === key ? "active" : ""}`}
            onClick={() => setType(key)}
            disabled={loading && type === key}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      <div className="table-wrapper">{renderContent()}</div>
    </div>
  );
};

export default HistoryPage;
