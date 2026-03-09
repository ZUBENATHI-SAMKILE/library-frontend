import { useState, useEffect } from "react";
import { getMyBorrowings, renewBorrowing } from "../../api";
import { Clock, CheckCircle, DollarSign, Library, RefreshCcw } from "lucide-react";

const STATUS_COLORS = { active: "info", overdue: "danger", returned: "success" };

export default function MyBorrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyBorrowings();
        setBorrowings(Array.isArray(data) ? data : []);
      } catch {
        setBorrowings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRenew = async (id) => {
    setRenewing(id);
    try {
      const updated = await renewBorrowing(id);
      setBorrowings((prev) => prev.map((b) => b.id === id ? { ...b, due_date: updated.due_date } : b));
      setMessage("✅ Book renewed for 14 more days!");
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.error || "Could not renew."));
    } finally {
      setRenewing(null);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const FILTERS = ["all", "active", "overdue", "returned"];
  const filtered = filter === "all" ? borrowings : borrowings.filter((b) => b.status === filter);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My <span>Borrowings</span></h1>
        <p className="page-subtitle">Track your current and past book loans</p>
      </div>

      {message && <div className={`message-bar ${message.startsWith("✅") ? "success" : "danger"}`}>{message}</div>}

      <div className="page-toolbar">
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="tab-count">{f === "all" ? borrowings.length : borrowings.filter((b) => b.status === f).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state"><p>Loading...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><RefreshCcw size={48} /></div>
            <p>No borrowings found.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
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
                  <td><strong>{b.book_title}</strong></td>
                  <td>{b.borrow_date}</td>
                  <td className={b.status === "overdue" || b.due_soon ? "text-danger" : ""}>{b.due_date}</td>
                  <td>{b.return_date || "—"}</td>
                  <td>
                    <span className={`badge ${b.status === "overdue" ? "badge-danger" : b.status === "returned" ? "badge-success" : b.due_soon ? "badge-warning" : "badge-info"}`}>
                      {b.due_soon && b.status === "active" ? "Due Soon" : b.status}
                    </span>
                  </td>
                  <td>
                    {b.status === "active" && !b.due_soon && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleRenew(b.id)} disabled={renewing === b.id}>
                        {renewing === b.id ? "Renewing..." : "Renew +14 days"}
                      </button>
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