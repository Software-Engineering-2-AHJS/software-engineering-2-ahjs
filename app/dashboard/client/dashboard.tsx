"use client";
import React, { useState, useRef } from "react";

// --- TYPES ---
type InvoiceStatus = "Approved" | "Draft" | "Processing";
type InvoiceType = "Income" | "Expense";

interface Invoice {
  date: string;
  counterparty: string;
  type: InvoiceType;
  amount: number;
  total: number;
  status: InvoiceStatus;
}

// --- MOCK INITIAL DATA ---
const MOCK_INVOICES: Invoice[] = [
  {
    date: "03/01/2026",
    counterparty: "Nordic Timber Oy",
    type: "Income",
    amount: 1240,
    total: 1240,
    status: "Approved",
  },
  {
    date: "03/01/2026",
    counterparty: "Savo Office Supply",
    type: "Expense",
    amount: 89.9,
    total: 89.9,
    status: "Approved",
  },
  {
    date: "03/02/2026",
    counterparty: "Joensuu Media House",
    type: "Income",
    amount: 560,
    total: 560,
    status: "Processing",
  },
];

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<"dashboard" | "settings">(
    "dashboard",
  );
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // OCR & File Upload States
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Invoice | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setPreviewUrl(URL.createObjectURL(file));

    setTimeout(() => {
      setExtractedData({
        date: new Date().toLocaleDateString(),
        counterparty: "Auto-Extracted Corp",
        type: "Expense",
        amount: 250.0,
        total: 250.0,
        status: "Draft",
      });
      setIsProcessing(false);
    }, 1500);
  };

  const handleSaveToLedger = () => {
    if (extractedData) {
      setInvoices((prev) => [extractedData, ...prev]);
      setPreviewUrl(null);
      setExtractedData(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCancelOCR = () => {
    setPreviewUrl(null);
    setExtractedData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`app ${theme}`}>
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo-group">
            <div className="logo-mark">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="6" fill="#0747a6" />
                <path
                  d="M9 10H23M9 16H19M9 22H23"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="brand-name">EntryBase</span>
          </div>
        </div>

        <div className="topbar-right">
          <div className="user-info">
            <span className="welcome-text">Welcome, Josh </span>
            <button className="logout-button">| Logout</button>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title="Toggle Theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-header">
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? "←" : "→"}
            </button>
          </div>
          <nav>
            <a
              href="#"
              className={currentView === "dashboard" ? "active" : ""}
              onClick={() => setCurrentView("dashboard")}
            >
              <span className="icon">⊞</span>
              {sidebarOpen && <span>Dashboard</span>}
            </a>
            <a
              href="#"
              className={currentView === "settings" ? "active" : ""}
              onClick={() => setCurrentView("settings")}
            >
              <span className="icon">⚙</span>
              {sidebarOpen && <span>Settings</span>}
            </a>
          </nav>
        </aside>

        <main className="main">
          <div className="content">
            {currentView === "dashboard" ? (
              <>
                <div className="content-header">
                  <h1>Invoices</h1>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden-input"
                    accept="image/*,.pdf"
                  />
                  <button
                    type="button"
                    className="upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    + UPLOAD INVOICE
                  </button>
                </div>

                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Counterparty</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, i) => (
                      <tr key={i}>
                        <td className="cell-date">{inv.date}</td>
                        <td className="cell-counterparty">
                          {inv.counterparty}
                        </td>
                        <td>
                          <span
                            className={`type-tag ${inv.type.toLowerCase()}`}
                          >
                            {inv.type}
                          </span>
                        </td>
                        <td className={`cell-amount ${inv.type.toLowerCase()}`}>
                          {inv.type === "Income" ? "+ " : "- "}$
                          {inv.amount.toFixed(2)}
                        </td>
                        <td className="cell-total">${inv.total.toFixed(2)}</td>
                        <td>
                          <span
                            className={`status-badge ${inv.status.toLowerCase()}`}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <div className="content-header">
                <h1>Settings</h1>
              </div>
            )}
          </div>
        </main>
      </div>

      {previewUrl && (
        <div className="modal-backdrop">
          <div className="ocr-modal">
            <div className="ocr-preview-pane">
              <header className="pane-header">Document Preview</header>
              <iframe
                src={previewUrl}
                className="preview-frame"
                title="Invoice Preview"
              />
            </div>

            <div className="ocr-edit-pane">
              <header className="pane-header">
                Extracted Data{" "}
                {isProcessing && (
                  <span className="loader">⏳ processing...</span>
                )}
              </header>

              <div className="edit-form">
                <div className="field">
                  <label>Counterparty</label>
                  <input
                    value={extractedData?.counterparty || ""}
                    disabled={isProcessing}
                    onChange={(e) =>
                      setExtractedData((prev) =>
                        prev ? { ...prev, counterparty: e.target.value } : null,
                      )
                    }
                    placeholder="Scanning document..."
                  />
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Amount</label>
                    <input
                      type="number"
                      disabled={isProcessing}
                      value={extractedData?.amount || 0}
                      onChange={(e) =>
                        setExtractedData((prev) =>
                          prev
                            ? { ...prev, amount: Number(e.target.value) }
                            : null,
                        )
                      }
                    />
                  </div>
                  <div className="field">
                    <label>Type</label>
                    <select
                      value={extractedData?.type || "Expense"}
                      disabled={isProcessing}
                      onChange={(e) =>
                        setExtractedData((prev) =>
                          prev
                            ? { ...prev, type: e.target.value as InvoiceType }
                            : null,
                        )
                      }
                    >
                      <option value="Income">Income</option>
                      <option value="Expense">Expense</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="actions">
                <button className="button-secondary" onClick={handleCancelOCR}>
                  Discard
                </button>
                <button
                  className="button-primary"
                  onClick={handleSaveToLedger}
                  disabled={isProcessing}
                >
                  Save to Ledger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
