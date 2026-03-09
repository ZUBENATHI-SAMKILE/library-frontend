import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyBorrowings, getMyFines, getCurrentUser } from "../../api";
import { Clock, DollarSign, Library, CheckCircle } from "lucide-react";

export default function MemberDashboard() {
  const [borrowings, setBorrowings] = useState([]);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    const load = async () => {
      try {
        const [b, f] = await Promise.allSettled([
          getMyBorrowings(),
          getMyFines(),
        ]);
        setBorrowings(
          b.status === "fulfilled" && Array.isArray(b.value) ? b.value : []
        );
        setFines(
          f.status === "fulfilled" && Array.isArray(f.value) ? f.value : []
        );
      } catch {
        setBorrowings([]);
        setFines([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const active = borrowings.filter((b) => b.status === "active");
  const overdue = borrowings.filter((b) => b.status === "overdue");
  const dueSoon = borrowings.filter((b) => b.due_soon);
  const unpaidFines = fines.filter((f) => !f.paid);
  const today = new Date();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Welcome, <span style={{ color: "var(--accent)" }}>
            {user?.name?.split(" ")[0]}
          </span>!
        </h1>
        <p className="page-subtitle">
          Here's your library activity at a glance.
        </p>
      </div>

      {/* Notifications */}
      {(overdue.length > 0 || dueSoon.length > 0 || unpaidFines.length > 0) && (
        <div className="notifications-bar">
          {overdue.length > 0 && (
            <div className="notif notif-danger">
              🔴 You have <strong>{overdue.length}</strong> overdue book
              {overdue.length > 1 ? "s" : ""}! Please return immediately.
            </div>
          )}
          {dueSoon.length > 0 && (
            <div className="notif notif-warning">
              🟡 <strong>{dueSoon.length}</strong> book
              {dueSoon.length > 1 ? "s are" : " is"} due within 3 days!
            </div>
          )}
          {unpaidFines.length > 0 && (
            <div className="notif notif-warning">
              <DollarSign size={21} /> You have <strong>{unpaidFines.length}</strong> unpaid fine
              {unpaidFines.length > 1 ? "s" : ""}. Total:{" "}
              <strong>
                ${unpaidFines
                  .reduce((s, f) => s + parseFloat(f.amount), 0)
                  .toFixed(2)}
              </strong>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="member-stats">
        <div className="member-stat-card">
          <span className="member-stat-icon"><Library size={21} /></span>
          <p className="member-stat-value">{active.length}</p>
          <p className="member-stat-label">Active Loans</p>
        </div>
        <div className="member-stat-card">
          <span className="member-stat-icon"><Clock size={21} /></span>
          <p className="member-stat-value">{overdue.length}</p>
          <p className="member-stat-label">Overdue</p>
        </div>
        <div className="member-stat-card">
          <span className="member-stat-icon"><DollarSign size={21} /></span>
          <p className="member-stat-value">
            ${unpaidFines
              .reduce((s, f) => s + parseFloat(f.amount), 0)
              .toFixed(2)}
          </p>
          <p className="member-stat-label">Fines Due</p>
        </div>
        <div className="member-stat-card">
          <span className="member-stat-icon"><CheckCircle size={21} /></span>
          <p className="member-stat-value">
            {borrowings.filter((b) => b.status === "returned").length}
          </p>
          <p className="member-stat-label">Books Returned</p>
        </div>
      </div>

      {/* Active Borrowings Table */}
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header">
          <h3 className="card-title">Active Borrowings</h3>
          <Link to="/member/borrowings" className="card-link">
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="empty-state"><p>Loading...</p></div>
        ) : active.length === 0 ? (
          <div className="empty-state">
            <p>
              No active borrowings.{" "}
              <Link
                to="/member/books"
                style={{ color: "var(--accent)" }}
              >
                Browse books →
              </Link>
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {active.slice(0, 5).map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.book_title}</strong></td>
                  <td>{b.borrow_date}</td>
                  <td className={b.due_soon ? "text-danger" : ""}>
                    {b.due_date}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        b.status === "overdue"
                          ? "badge-danger"
                          : b.due_soon
                          ? "badge-warning"
                          : "badge-success"
                      }`}
                    >
                      {b.due_soon ? "Due Soon" : b.status}
                    </span>
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