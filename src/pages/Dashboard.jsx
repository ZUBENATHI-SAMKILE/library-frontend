import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import { getDashboardStats } from "../api";
import { Book, Users, RefreshCcw, DollarSign } from "lucide-react";


const MOCK_STATS = {
  total_books: 1240,
  available_books: 983,
  total_members: 342,
  active_members: 289,
  active_borrowings: 57,
  overdue_borrowings: 12,
  unpaid_fines: 8,
  total_fines_collected: 450,
  recent_borrowings: [
    { id: 1, member: "Alice Johnson", book: "The Great Gatsby", borrow_date: "2026-02-20", due_date: "2026-03-06", status: "active" },
    { id: 2, member: "Bob Smith", book: "To Kill a Mockingbird", borrow_date: "2026-02-18", due_date: "2026-03-04", status: "overdue" },
    { id: 3, member: "Carol White", book: "1984", borrow_date: "2026-02-22", due_date: "2026-03-08", status: "active" },
    { id: 4, member: "David Brown", book: "Brave New World", borrow_date: "2026-02-15", due_date: "2026-03-01", status: "overdue" },
    { id: 5, member: "Eve Davis", book: "The Catcher in the Rye", borrow_date: "2026-02-23", due_date: "2026-03-09", status: "active" },
  ],
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        setStats(MOCK_STATS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back — here's what's happening in your library today.</p>
      </div>

      <div className="stats-grid">
        <StatCard icon={<Book size={22} />} label="Total Books" value={stats.total_books} sub={`${stats.available_books} available`} color="green" />
        <StatCard icon={<Users size={22} />} label="Total Members" value={stats.total_members} sub={`${stats.active_members} active`} color="blue" />
        <StatCard icon={<RefreshCcw size={22} />} label="Active Borrowings" value={stats.active_borrowings} sub={stats.overdue_borrowings > 0 ? `${stats.overdue_borrowings} overdue!` : null} color="gold" />
        <StatCard icon={<DollarSign size={22} />} label="Unpaid Fines" value={stats.unpaid_fines} sub={`$${stats.total_fines_collected} collected`} color="red" />
      </div>

      <div className="dashboard-bottom">
        <div className="card recent-card">
          <div className="card-header">
            <h3 className="card-title">Recent Borrowings</h3>
            <a href="/borrowings" className="card-link">View all →</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_borrowings?.map((b) => (
                <tr key={b.id}>
                  <td>{b.member}</td>
                  <td>{b.book}</td>
                  <td>{b.borrow_date}</td>
                  <td>{b.due_date}</td>
                  <td>
                    <span className={`badge badge-${b.status === "overdue" ? "danger" : "success"}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}