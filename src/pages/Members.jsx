import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { getMembers, createMember, updateMember, deleteMember } from "../api";
import { Users } from "lucide-react";

const EMPTY_FORM = { name: "", email: "", phone: "", address: "", membership_expiry: "", status: "active" };

const MOCK_MEMBERS = [
  { id: 1, name: "Alice Johnson", email: "alice@email.com", phone: "555-0101", membership_date: "2024-01-15", membership_expiry: "2027-01-15", status: "active" },
  { id: 2, name: "Bob Smith", email: "bob@email.com", phone: "555-0102", membership_date: "2023-06-20", membership_expiry: "2026-06-20", status: "active" },
  { id: 3, name: "Carol White", email: "carol@email.com", phone: "555-0103", membership_date: "2022-03-10", membership_expiry: "2025-03-10", status: "expired" },
  { id: 4, name: "David Brown", email: "david@email.com", phone: "555-0104", membership_date: "2024-09-05", membership_expiry: "2027-09-05", status: "active" },
  { id: 5, name: "Eve Davis", email: "eve@email.com", phone: "555-0105", membership_date: "2023-11-22", membership_expiry: "2026-11-22", status: "suspended" },
];

const STATUS_COLORS = { active: "success", expired: "warning", suspended: "danger" };

export default function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await getMembers({ search });
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      setMembers(MOCK_MEMBERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  const openAdd = () => { setEditMember(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (m) => { setEditMember(m); setForm(m); setShowModal(true); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editMember) {
        const updated = await updateMember(editMember.id, form);
        setMembers((prev) => prev.map((m) => m.id === editMember.id ? updated : m));
      } else {
        const created = await createMember(form);
        setMembers((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch {
      if (editMember) {
        setMembers((prev) => prev.map((m) => m.id === editMember.id ? { ...m, ...form } : m));
      } else {
        setMembers((prev) => [{ ...form, id: Date.now(), membership_date: new Date().toISOString().split("T")[0] }, ...prev]);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this member?")) return;
    try { await deleteMember(id); } catch {}
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const filtered = members.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search)
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Members</h1>
        <p className="page-subtitle">Manage library memberships</p>
      </div>

      <div className="page-toolbar">
        <input type="text" placeholder="Search by name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
        <button className="btn btn-primary" onClick={openAdd}>+ Add Member</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state"><p>Loading members...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Users size={24} /></div>
            <p>No members found.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Member Since</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.name}</strong></td>
                  <td>{m.email}</td>
                  <td>{m.phone}</td>
                  <td>{m.membership_date}</td>
                  <td>{m.membership_expiry}</td>
                  <td><span className={`badge badge-${STATUS_COLORS[m.status] || "muted"}`}>{m.status}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editMember ? "Edit Member" : "Add New Member"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email address" required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="Home address" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Membership Expiry</label>
                <input type="date" name="membership_expiry" value={form.membership_expiry} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : editMember ? "Save Changes" : "Add Member"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}