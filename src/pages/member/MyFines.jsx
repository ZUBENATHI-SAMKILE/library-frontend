import { useState, useEffect } from "react";
import { getMyFines } from "../../api";
import { DollarSign } from "lucide-react";

export default function MyFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyFines();
        setFines(Array.isArray(data) ? data : []);
      } catch {
        setFines([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const unpaid = fines.filter((f) => !f.paid);
  const paid = fines.filter((f) => f.paid);

  const totalDue = unpaid.reduce(
    (sum, f) => sum + Number(f.amount || 0),
    0
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          My <span>Fines</span>
        </h1>
        <p className="page-subtitle">View your overdue fines</p>
      </div>

      {totalDue > 0 && (
        <div className="fine-alert">
          <p>
            <DollarSign size={21} /> You have{" "}
            <strong>${totalDue.toFixed(2)}</strong> in unpaid fines. Please
            visit the library to pay.
          </p>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="empty-state">
            <p>Loading your fines...</p>
          </div>
        ) : fines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <p>No fines! You're all clear.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Days Overdue</th>
                <th>Amount</th>
                <th>Date Issued</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {fines.map((fine) => (
                <tr key={fine.id}>
                  <td>
                    <strong>{fine.book_title}</strong>
                  </td>

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
                    {new Date(fine.created_at).toLocaleDateString()}
                  </td>

                  <td>
                    {fine.paid ? (
                      <span className="badge badge-success">
                        Paid on{" "}
                        {new Date(fine.paid_date).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        Unpaid — pay at library
                      </span>
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