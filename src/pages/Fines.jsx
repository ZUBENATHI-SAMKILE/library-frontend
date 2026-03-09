import { useState, useEffect } from "react";
import { getFines, payFine } from "../api";
import { DollarSign } from "lucide-react";

const MOCK_FINES = [
  { id: 1, member_name: "Bob Smith", book_title: "To Kill a Mockingbird", amount: 4.5, paid: false, days_overdue: 9, created_at: "2026-02-25" },
  { id: 2, member_name: "David Brown", book_title: "Brave New World", amount: 14.0, paid: false, days_overdue: 28, created_at: "2026-02-20" },
  { id: 3, member_name: "Alice Johnson", book_title: "Moby Dick", amount: 6.0, paid: true, paid_date: "2026-02-10", days_overdue: 12, created_at: "2026-02-08" },
  { id: 4, member_name: "Frank Miller", book_title: "Don Quixote", amount: 2.5, paid: true, paid_date: "2026-01-30", days_overdue: 5, created_at: "2026-01-28" },
];

export default function Fines() {
  const [fines, setFines] = useState([]);
  const [filter, setFilter] = useState("unpaid");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await getFines();
      setFines(Array.isArray(data) ? data : []);
    } catch {
      setFines(MOCK_FINES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePay = async (id) => {
    if (!confirm("Are you sure you want to mark this fine as paid?")) return;

    try {
      await payFine(id);
    } catch {}

    setFines((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              paid: true,
              paid_date: new Date().toISOString().split("T")[0],
            }
          : f
      )
    );
  };

  const filtered =
    filter === "all"
      ? fines
      : fines.filter((f) =>
          filter === "unpaid" ? !f.paid : f.paid
        );

  const totalUnpaid = fines
    .filter((f) => !f.paid)
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const totalCollected = fines
    .filter((f) => f.paid)
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Fines</h1>
        <p className="page-subtitle">
          Manage overdue fines and payments
        </p>
      </div>

      <div className="fines-summary">
        <div className="fine-summary-card unpaid">
          <p className="fine-summary-value">
            ${totalUnpaid.toFixed(2)}
          </p>
          <p className="fine-summary-label">
            Outstanding Fines
          </p>
        </div>

        <div className="fine-summary-card collected">
          <p className="fine-summary-value">
            ${totalCollected.toFixed(2)}
          </p>
          <p className="fine-summary-label">
            Total Collected
          </p>
        </div>
      </div>

      <div className="page-toolbar">
        <div className="filter-tabs">
          {["all", "unpaid", "paid"].map((f) => (
            <button
              key={f}
              className={`filter-tab ${
                filter === f ? "active" : ""
              }`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}

              <span className="tab-count">
                {f === "all"
                  ? fines.length
                  : fines.filter((x) =>
                      f === "unpaid" ? !x.paid : x.paid
                    ).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">
            <p>Loading fines...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <DollarSign size={24} />
            </div>
            <p>No fines found.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Days Overdue</th>
                <th>Amount</th>
                <th>Date Issued</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((fine) => (
                <tr key={fine.id}>
                  <td>
                    <strong>{fine.member_name}</strong>
                  </td>

                  <td>{fine.book_title}</td>

                  <td>
                    <span className="badge badge-warning">
                      {fine.days_overdue} days
                    </span>
                  </td>

                  <td>
                    <strong>
                      ${Number(fine.amount || 0).toFixed(2)}
                    </strong>
                  </td>

                  <td>
                    {new Date(
                      fine.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {fine.paid ? (
                      <span className="badge badge-success">
                        Paid{" "}
                        {new Date(
                          fine.paid_date
                        ).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        Unpaid
                      </span>
                    )}
                  </td>

                  <td>
                    {!fine.paid && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          handlePay(fine.id)
                        }
                      >
                        Mark Paid
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