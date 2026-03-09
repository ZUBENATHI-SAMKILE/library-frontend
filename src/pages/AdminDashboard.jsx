import { useState, useEffect } from "react";
import { getStaffList, updateStaff, getActivityLogs, getAdminReports, getMembers} from "../api";
import { Library, Users } from "lucide-react";

const TABS = [
  { id: "staff", label: "👤 Staff Management" },
  { id: "members", label: "👥 Promote Members" },
  { id: "logs", label: "📋 Activity Logs" },
  { id: "reports", label: "📊 Reports" },
];

export default function AdminDashboard() {
  const [staff, setStaff] = useState([]);
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [reports, setReports] = useState(null);
  const [activeTab, setActiveTab] = useState("staff");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [s, l, r, m] = await Promise.all([
          getStaffList(), getActivityLogs(),
          getAdminReports(), getMembers()
        ]);
        setStaff(Array.isArray(s) ? s : []);
        setLogs(Array.isArray(l) ? l : []);
        setReports(r);
        setMembers(Array.isArray(m) ? m : []);
      } catch {
        setStaff([]);
        setLogs([]);
        setReports(null);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleActive = async (id, current) => {
    try { await updateStaff(id, { is_active: !current }); } catch {}
    setStaff((prev) => prev.map((s) => s.id === id ? { ...s, is_active: !current } : s));
  };

  const changeRole = async (id, role) => {
    try { await updateStaff(id, { role }); } catch {}
    setStaff((prev) => prev.map((s) => s.id === id ? { ...s, role } : s));
  };

  const promoteToLibrarian = async (memberId, memberName, memberEmail) => {
    if (!confirm(`Promote ${memberName} to Librarian? They will get staff access.`)) return;
    try {
      // Create a staff account for this member
      await fetch("http://localhost:8000/api/admin/promote/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ member_id: memberId }),
      });
      setMessage(`✅ ${memberName} promoted to Librarian!`);
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("❌ Could not promote member.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Full system control staff, members, logs and reports</p>
      </div>

      {message && (
        <div className={`message-bar ${message.startsWith("✅") ? "success" : "danger"}`}
          style={{ marginBottom: "1rem" }}>
          {message}
        </div>
      )}

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`admin-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading...</p></div>
      ) : activeTab === "staff" ? (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th>
                <th>Joined</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.email}</td>
                  <td>
                    <select className="role-select" value={s.role}
                      onChange={(e) => changeRole(s.id, e.target.value)}>
                      <option value="librarian">Librarian</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{s.joined}</td>
                  <td>
                    <span className={`badge ${s.is_active ? "badge-success" : "badge-danger"}`}>
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${s.is_active ? "btn-danger" : "btn-success"}`}
                      onClick={() => toggleActive(s.id, s.is_active)}
                    >
                      {s.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      ) : activeTab === "members" ? (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Promote Members to Librarian</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th>
                <th>Member Since</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>No members found</td></tr>
              ) : members.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.name}</strong></td>
                  <td>{m.email}</td>
                  <td>{m.phone || "—"}</td>
                  <td>{m.membership_date}</td>
                  <td><span className="badge badge-info">Member</span></td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => promoteToLibrarian(m.id, m.name, m.email)}
                    >
                      Promote to Librarian
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      ) : activeTab === "logs" ? ( 
        <div className="card">
          <table className="data-table">
            <thead>
              <tr><th>Action</th><th>Details</th><th>Staff</th><th>Timestamp</th></tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td><span className="badge badge-info">{log.action}</span></td>
                  <td>{log.details}</td>
                  <td>{log.user}</td>
                  <td className="mono">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="card-header">
            <h3 className="card-title"><Library size={20} /> Most Borrowed Books</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Title</th><th>Author</th><th>Times Borrowed</th></tr>
            </thead>
            <tbody>
              {reports?.most_borrowed?.map((b, i) => (
                <tr key={i}>
                  <td><strong>{i + 1}</strong></td>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td><span className="badge badge-success">{b.borrow_count}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}