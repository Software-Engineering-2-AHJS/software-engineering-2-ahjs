"use client";
import { useEffect, useState } from "react";

type InvoiceStatus = "Approved" | "Draft" | "Processing";
type InvoiceType = "Income" | "Expense";

type Invoice = {
  date: string;
  counterparty: string;
  type: InvoiceType;
  amount: number;
  total: number;
  status: InvoiceStatus;
};

type UploadInvoiceData = {
  counterparty: string;
  type: InvoiceType;
  amount: number;
  status: InvoiceStatus;
};

async function getInvoice(): Promise<Invoice[]> {
  return (await fetch("/api/invoice")).json();
}

function UploadInvoiceModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UploadInvoiceData) => void;
}) {
  const [counterparty, setCounterparty] = useState<string>("");
  const [type, setType] = useState<InvoiceType>("Income");
  const [amount, setAmount] = useState<string>("");
  const [status, setStatus] = useState<InvoiceStatus>("Draft");

  const canSubmit =
    counterparty.trim().length > 0 &&
    Number.isFinite(Number(amount)) &&
    Number(amount) > 0;

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Upload Invoice</h2>
          <button type="button" className="button-secondary" onClick={onClose}>
            Close
          </button>
          <input
            type="file"
            accept="application/pdf"
            onChange={async (x) => {
              if (x.target.files) {
                for (const file of x.target.files) {
                  fetch("/api/invoice", {
                    body: await file.bytes(),
                    method: "POST",
                  });
                }
              }
            }}
          />
        </div>

        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;

            onSubmit({
              counterparty: counterparty.trim(),
              type,
              amount: Number(amount),
              status,
            });

            setCounterparty("");
            setType("Income");
            setAmount("");
            setStatus("Draft");
            onClose();
          }}
        >
          <label className="field">
            <span className="label">Counterparty</span>
            <input
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder="e.g. Acme Inc."
              autoFocus
            />
          </label>

          <div className="form-row">
            <label className="field">
              <span className="label">Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as InvoiceType)}
              >
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </label>

            <label className="field">
              <span className="label">Amount</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="e.g. 250"
              />
            </label>
          </div>

          <label className="field">
            <span className="label">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
            >
              <option value="Approved">Approved</option>
              <option value="Draft">Draft</option>
              <option value="Processing">Processing</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="submit" disabled={!canSubmit}>
              Add invoice
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditInvoiceDetailsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [date, setDate] = useState<string>("");
  const [counterparty, setCounterparty] = useState<string>("");
  const [type, setType] = useState<InvoiceType>("Income");
  const [amount, setAmount] = useState<string>("");
  const [total, setTotal] = useState<string>("");
  const [status, setStatus] = useState<InvoiceStatus>("Draft");

  const canSubmit =
    date.trim().length > 0 &&
    counterparty.trim().length > 0 &&
    Number.isFinite(Number(amount)) &&
    Number(amount) > 0 &&
    Number.isFinite(Number(total)) &&
    Number(total) > 0;

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Edit Invoice Details</h2>
          <button type="button" className="button-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            onClose();
          }}
        >
          <label className="field">
            <span className="label">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              autoFocus
            />
          </label>

          <label className="field">
            <span className="label">Counterparty</span>
            <input
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder="e.g. Acme Inc."
            />
          </label>

          <div className="form-row">
            <label className="field">
              <span className="label">Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as InvoiceType)}
              >
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </label>

            <label className="field">
              <span className="label">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              >
                <option value="Approved">Approved</option>
                <option value="Draft">Draft</option>
                <option value="Processing">Processing</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label className="field">
              <span className="label">Amount</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="e.g. 250"
              />
            </label>

            <label className="field">
              <span className="label">Total</span>
              <input
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                inputMode="decimal"
                placeholder="e.g. 250"
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={!canSubmit}>
              Save changes
            </button>
            <button type="button" className="button-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const loadInvoices = async () => {
      try {
        const data = await getInvoice();
        if (isMounted) {
          setInvoices(data);
        }
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      }
    };

    loadInvoices();

    return () => {
      isMounted = false;
    };
  }, []);

  const addInvoice = (
    counterparty: string,
    type: InvoiceType,
    amount: number,
    status: InvoiceStatus,
  ) => {
    const today = new Date().toLocaleDateString();

    const newInvoice: Invoice = {
      date: today,
      counterparty,
      type,
      amount,
      total: amount,
      status,
    };

    setInvoices((prev) => [...prev, newInvoice]);
  };

  return (
    <div className={`app ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-top-row">
          <div className="logo">{sidebarOpen ? "EntryBase" : "EB"}</div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        <nav>
          <a className="active">Dashboard</a>
          <a>Settings</a>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>Welcome, Josh 🫡</div>
          <a href="#">Logout</a>
        </header>

        <div className="content">
          <div className="content-header">
            <h1>Invoices</h1>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" onClick={() => setEditModalOpen(true)}>
                Edit Invoice Details
              </button>
              <button type="button" onClick={() => setUploadModalOpen(true)}>
                + Upload Invoice
              </button>
            </div>
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
              {invoices.map((invoice, idx) => (
                <tr key={`${invoice.date}-${invoice.counterparty}-${idx}`}>
                  <td>{invoice.date}</td>
                  <td>{invoice.counterparty}</td>
                  <td>{invoice.type}</td>
                  <td>${invoice.amount.toFixed(2)}</td>
                  <td>${invoice.total.toFixed(2)}</td>
                  <td>
                    <span className={`status ${invoice.status.toLowerCase()}`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <UploadInvoiceModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmit={({ counterparty, type, amount, status }) =>
          addInvoice(counterparty, type, amount, status)
        }
      />
      <EditInvoiceDetailsModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </div>
  );
}
