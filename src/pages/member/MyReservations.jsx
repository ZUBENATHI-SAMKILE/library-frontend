import { useState, useEffect } from "react";
import { getMyReservations, cancelMyReservation } from "../../api";
import { Bookmark } from "lucide-react";

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyReservations();
        setReservations(Array.isArray(data) ? data : []);
      } catch {
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this reservation?")) return;
    try { await cancelMyReservation(id); } catch {}
    setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status: "cancelled" } : r));
  };

  const STATUS_COLORS = { pending: "warning", fulfilled: "success", cancelled: "muted" };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My <span>Reservations</span></h1>
        <p className="page-subtitle">Books you've reserved</p>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state"><p>Loading...</p></div>
        ) : reservations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Bookmark size={48} /></div>
            <p>No reservations yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Reserved Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.book_title}</strong></td>
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
    </div>
  );
}