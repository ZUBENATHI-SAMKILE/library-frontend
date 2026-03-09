import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { getBorrowings, issueBorrowing, returnBorrowing, getMembers, getBooks } from "../api";
import { RefreshCcw } from "lucide-react";

const STATUS_COLORS = { active: "info", overdue: "danger", returned: "success" };
const FILTERS = ["all", "active", "overdue", "returned"];

export default function Borrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ member: "", book: "", due_date: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [b, m, bk] = await Promise.all([
        getBorrowings(),
        getMembers(),
        getBooks(),
      ]);
      setBorrowings(Array.isArray(b) ? b : []);
      setMembers(Array.isArray(m) ? m : []);
      setBooks(Array.isArray(bk) ? bk : []);
    } catch {
      setBorrowings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleIssue = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const created = await issueBorrowing({
        member: parseInt(form.member),
        book: parseInt(form.book),
        due_date: form.due_date,
      });
      setBorrowings((prev) => [created, ...prev]);
      setShowModal(false);
      setForm({ member: "", book: "", due_date: "" });
      // Reload to get updated available copies
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not issue book. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = async (id) => {
    if (!confirm("Mark this book as returned?")) return;
    try {
      await returnBorrowing(id);
      setBorrowings((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, status: "returned", return_date: new Date().toISOString().split("T")[0] }
            : b
        )
      );
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not return book.");
    }
  };

  // Default due date = 14 days from today
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  };

  const openModal = () => {
    setForm({ member: "", book: "", due_date: defaultDueDate() });
    setError("");
    setShowModal(true);
  };

  const filtered =
    filter === "all"
      ? borrowings
      : borrowings.filter((b) => b.status === filter);

  const availableBooks = books.filter((b) => b.available_copies > 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Borrowings</h1>
        <p className="page-subtitle">Track book loans and returns</p>
      </div>

      <div className="page-toolbar">
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="tab-count">
                {f === "all"
                  ? borrowings.length
                  : borrowings.filter((b) => b.status === f).length}
              </span>
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          + Issue Book
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state"><p>Loading borrowings...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><RefreshCcw size={24} /></div>
            <p>No borrowings found.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.member_name}</strong></td>
                  <td>{b.book_title}</td>
                  <td>{b.borrow_date}</td>
                  <td className={b.status === "overdue" ? "text-danger" : ""}>
                    {b.due_date}
                  </td>
                  <td>{b.return_date || "—"}</td>
                  <td>
                    <span className={`badge badge-${STATUS_COLORS[b.status] || "info"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    {b.status !== "returned" && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleReturn(b.id)}
                      >
                        ✓ Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title="Issue Book to Member" onClose={() => setShowModal(false)} size="sm">
          <form onSubmit={handleIssue}>
            {error && (
              <div className="auth-error" style={{ marginBottom: "1rem" }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Select Member</label>
              <select
                name="member"
                value={form.member}
                onChange={handleChange}
                required
              >
                <option value="">— Choose a member —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Book</label>
              <select
                name="book"
                value={form.book}
                onChange={handleChange}
                required
              >
                <option value="">— Choose a book —</option>
                {availableBooks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} by {b.author} ({b.available_copies} available)
                  </option>
                ))}
              </select>
              {availableBooks.length === 0 && (
                <p style={{ color: "var(--danger)", fontSize: "0.82rem", marginTop: "4px" }}>
                  No books available to issue right now.
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || availableBooks.length === 0}
              >
                {saving ? "Issuing..." : "Issue Book"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}