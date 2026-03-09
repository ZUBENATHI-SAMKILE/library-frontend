import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { getReservations, createReservation, cancelReservation } from "../api";
import { Bookmark } from "lucide-react";


const MOCK_RESERVATIONS = [
  { id: 1, member_name: "Alice Johnson", book_title: "The Great Gatsby", reserved_date: "2026-02-24", status: "pending" },
  { id: 2, member_name: "Frank Miller", book_title: "Dune", reserved_date: "2026-02-23", status: "fulfilled" },
  { id: 3, member_name: "Grace Lee", book_title: "1984", reserved_date: "2026-02-25", status: "pending" },
  { id: 4, member_name: "Henry Wilson", book_title: "Brave New World", reserved_date: "2026-02-20", status: "cancelled" },
];

const STATUS_COLORS = { pending: "warning", fulfilled: "success", cancelled: "muted" };

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ member_id: "", book_id: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await getReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch {
      setReservations(MOCK_RESERVATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleReserve = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await createReservation(form);
      setReservations((prev) => [created, ...prev]);
    } catch {
      setReservations((prev) => [{
        id: Date.now(), member_name: "New Member", book_title: "Reserved Book",
        reserved_date: new Date().toISOString().split("T")[0], status: "pending"
      }, ...prev]);
    } finally {
      setSaving(false);
      setShowModal(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Cancel this reservation?")) return;
    try { await cancelReservation(id); } catch {}
    setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status: "cancelled" } : r));
  };

  const filtered = filter === "all" ? reservations : reservations.filter((r) => r.status === filter);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reservations</h1>
        <p className="page-subtitle">Manage book reservations by members</p>
      </div>

      <div className="page-toolbar">
        <div className="filter-tabs">
          {["all", "pending", "fulfilled", "cancelled"].map((f) => (
            <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="tab-count">{f === "all" ? reservations.length : reservations.filter((r) => r.status === f).length}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Reservation</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state"><p>Loading reservations...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Bookmark size={24} /></div>
            <p>No reservations found.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Reserved Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.member_name}</strong></td>
                  <td>{r.book_title}</td>
                  <td>{r.reserved_date}</td>
                  <td><span className={`badge badge-${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                  <td>
                    {r.status === "pending" && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(r.id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title="New Reservation" onClose={() => setShowModal(false)} size="sm">
          <form onSubmit={handleReserve}>
            <div className="form-group">
              <label>Member ID</label>
              <input name="member_id" value={form.member_id} onChange={handleChange} placeholder="Enter member ID" required />
            </div>
            <div className="form-group">
              <label>Book ID</label>
              <input name="book_id" value={form.book_id} onChange={handleChange} placeholder="Enter book ID" required />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Reserving..." : "Reserve Book"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}