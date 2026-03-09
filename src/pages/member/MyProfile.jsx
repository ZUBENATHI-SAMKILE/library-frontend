import { useState, useEffect } from "react";
import { getMemberProfile, updateMemberProfile, logout } from "../../api";
import { useNavigate } from "react-router-dom";

export default function MyProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMemberProfile();
        setProfile(data);
        setForm({ name: data.name, phone: data.phone || "", address: data.address || "", password: "" });
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = { name: form.name, phone: form.phone, address: form.address };
      if (form.password) updates.password = form.password;
      await updateMemberProfile(updates);
      setMessage("✅ Profile updated successfully!");
      setForm((prev) => ({ ...prev, password: "" }));
    } catch {
      setMessage("❌ Could not update profile.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <div className="page-loading">Loading profile...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My <span>Profile</span></h1>
        <p className="page-subtitle">Update your personal information</p>
      </div>

      {message && <div className={`message-bar ${message.startsWith("✅") ? "success" : "danger"}`}>{message}</div>}

      <div className="profile-card card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-lg">{profile?.name?.[0]?.toUpperCase()}</div>
          <div>
            <p className="profile-name-lg">{profile?.name}</p>
            <p className="profile-email-lg">{profile?.email}</p>
            <span className="badge badge-success">Active Member</span>
          </div>
        </div>

        <div className="profile-details">
          <p><strong>Member Since:</strong> {profile?.membership_date}</p>
          <p><strong>Membership Expiry:</strong> {profile?.membership_expiry}</p>
          <p><strong>Status:</strong> <span className="badge badge-success">{profile?.status}</span></p>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <h3 className="section-heading">Edit Information</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" />
            </div>
            <div className="form-group">
              <label>New Password (optional)</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current" minLength={6} />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Home address" />
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}