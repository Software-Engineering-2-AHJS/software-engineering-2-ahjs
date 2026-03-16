"use client";

import { useState } from "react";

type InvoiceType = "Income" | "Expense";
type InvoiceStatus = "reviewed" | "pending" | "processing" | "draft";

type Client = {
  id: string;
  name: string;
  email: string;
};

type AdminInvoice = {
  id: string;
  name: string;
  client: string;
  date: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  amount: number;
  currency: string;
};

const STATUS_STYLES: Record<InvoiceStatus, { label: string; className: string }> = {
  reviewed:   { label: "reviewed",   className: "status-reviewed"   },
  pending:    { label: "pending",    className: "status-pending"    },
  processing: { label: "processing", className: "status-processing" },
  draft:      { label: "draft",      className: "status-draft"      },
};

type FilterOption = "All" | InvoiceStatus;

type EditInvoiceState = {
  open: boolean;
  invoice: AdminInvoice | null;
};

type AddClientState = {
  open: boolean;
};

const EMPTY_INVOICES: AdminInvoice[] = [];

function EditInvoiceModal({
  state,
  onClose,
  onSave,
}: {
  state: EditInvoiceState;
  onClose: () => void;
  onSave: (invoice: AdminInvoice) => void;
}) {
  if (!state.open || !state.invoice) return null;

  const [localInvoice, setLocalInvoice] = useState<AdminInvoice>(state.invoice);

  const handleChange = <K extends keyof AdminInvoice>(key: K, value: AdminInvoice[K]) => {
    setLocalInvoice((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localInvoice);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Edit Invoice</h2>
          <button type="button" className="button-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="field">
              <span className="label">Name</span>
              <input
                value={localInvoice.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </label>
            <label className="field">
              <span className="label">Client</span>
              <input
                value={localInvoice.client}
                onChange={(e) => handleChange("client", e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="field">
              <span className="label">Amount</span>
              <input
                value={localInvoice.amount}
                onChange={(e) =>
                  handleChange("amount", Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))
                }
                inputMode="decimal"
              />
            </label>
            <label className="field">
              <span className="label">Currency</span>
              <input
                value={localInvoice.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="field">
              <span className="label">Status</span>
              <select
                value={localInvoice.status}
                onChange={(e) => handleChange("status", e.target.value as InvoiceStatus)}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="reviewed">Reviewed</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="field">
              <span className="label">Type</span>
              <select
                value={localInvoice.type}
                onChange={(e) => handleChange("type", e.target.value as InvoiceType)}
              >
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit">Save changes</button>
            <button type="button" className="button-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddClientModal({
  state,
  onClose,
  onAdd,
}: {
  state: AddClientState;
  onClose: () => void;
  onAdd: (client: Client) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (!state.open) return null;

  const canSubmit = name.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onAdd({
      id: String(Date.now()),
      name: name.trim(),
      email: email.trim(),
    });
    setName("");
    setEmail("");
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Client</h2>
          <button type="button" className="button-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label">Client name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Inc."
              autoFocus
            />
          </label>

          <label className="field">
            <span className="label">Email (optional)</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. billing@acme.com"
            />
          </label>

          <div className="form-actions">
            <button type="submit" disabled={!canSubmit}>
              Add client
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

function StatCard({
  icon,
  value,
  label,
  iconColor,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  iconColor: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-body">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

function InvoiceRow({
  invoice,
  onEdit,
}: {
  invoice: AdminInvoice;
  onEdit: (id: string) => void;
}) {
  const s = STATUS_STYLES[invoice.status];
  return (
    <div className="invoice-row">
      <div className="invoice-icon-wrap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </div>
      <div className="invoice-info">
        <span className="invoice-name">{invoice.name}</span>
        <span className="invoice-meta">
          {invoice.client} · {invoice.date} · {invoice.invoiceNumber}
        </span>
      </div>
      <div className="invoice-right">
        <span className="badge badge-type">{invoice.type}</span>
        <span className={`badge ${s.className}`}>{s.label}</span>
        <span className="invoice-amount">
          {invoice.currency} {invoice.amount.toFixed(2)}
        </span>
        <button className="edit-btn" onClick={() => onEdit(invoice.id)} title="Edit">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [invoices, setInvoices] = useState<AdminInvoice[]>(EMPTY_INVOICES);
  const [filter, setFilter] = useState<FilterOption>("All");
  const [clients, setClients] = useState<Client[]>([]);
  const [editState, setEditState] = useState<EditInvoiceState>({
    open: false,
    invoice: null,
  });
  const [addClientState, setAddClientState] = useState<AddClientState>({
    open: false,
  });

  const totalInvoices = invoices.length;
  const pendingReview = invoices.filter((i) => i.status === "pending").length;
  const reviewed = invoices.filter((i) => i.status === "reviewed").length;
  const activeClients = clients.length;

  const filtered =
    filter === "All" ? invoices : invoices.filter((i) => i.status === filter);

  const handleOpenEdit = (id: string) => {
    const invoice = invoices.find((i) => i.id === id) || null;
    if (!invoice) return;
    setEditState({ open: true, invoice });
  };

  const handleSaveInvoice = (updated: AdminInvoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
    setEditState({ open: false, invoice: null });
  };

  const handleAddClient = (client: Client) => {
    setClients((prev) => [...prev, client]);
    setAddClientState({ open: false });
  };

  return (
    <>
      <div className="app">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="logo">
              <div className="logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              InvoiceSnap
            </div>
            <span className="admin-badge">Admin</span>
          </div>
          <div className="topbar-right">
            <button
              className="add-client-btn"
              type="button"
              onClick={() => setAddClientState({ open: true })}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              Add Client
            </button>
            <button className="signout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </header>

        <div className="page">
          {/* Stat cards */}
          <div className="stats-grid">
            <StatCard
              value={totalInvoices}
              label="Total Invoices"
              iconColor="#2563eb"
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              }
            />
            <StatCard
              value={pendingReview}
              label="Pending Review"
              iconColor="#d97706"
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4"  />
                  <line x1="6"  y1="20" x2="6"  y2="14" />
                  <line x1="2"  y1="20" x2="22" y2="20" />
                </svg>
              }
            />
            <StatCard
              value={reviewed}
              label="Reviewed"
              iconColor="#16a34a"
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
            />
            <StatCard
              value={activeClients}
              label="Active Clients"
              iconColor="#2563eb"
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />
          </div>

          {/* Filter */}
          <div className="filter-row">
            <span className="filter-label">Filter:</span>
            <select
              className="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterOption)}
            >
              <option value="All">All</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="processing">Processing</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Invoice rows */}
          <div className="invoices-list">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <p>No invoices found</p>
                <p>Try changing the filter</p>
              </div>
            ) : (
              filtered.map((inv) => (
                <InvoiceRow
                  key={inv.id}
                  invoice={inv}
                  onEdit={handleOpenEdit}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <EditInvoiceModal
        state={editState}
        onClose={() => setEditState({ open: false, invoice: null })}
        onSave={handleSaveInvoice}
      />

      <AddClientModal
        state={addClientState}
        onClose={() => setAddClientState({ open: false })}
        onAdd={handleAddClient}
      />
    </>
  );
}
