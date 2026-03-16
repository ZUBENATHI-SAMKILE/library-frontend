import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { memberRegister } from "../api";
import { BookOpen, User, Lock, Mail, Phone, Home, University } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm_password: "", phone: "", address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await memberRegister(
        form.name, form.email, form.password,
        form.phone, form.address
      );
      navigate("/member/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-scene">
      <div className={`auth-float-card auth-float-card--wide ${mounted ? "visible" : ""}`}>

        <div className="auth-logo-wrap">
          <div className="auth-logo-circle"><BookOpen size={26} color="white" /></div>
        </div>

        <h1 className="auth-headline">Join LibraryMS</h1>
        <p className="auth-tagline">Start your reading journey today</p>

        {error && <div className="auth-alert">{error}</div>}

        <form className="auth-form-inner" onSubmit={handleSubmit}>
          <div className="auth-form-grid">
            <div className="auth-field">
              <span className="field-icon"><User size={20} /></span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
            </div>
            <div className="auth-field">
              <span className="field-icon"><Mail size={20} /></span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                required
              />
            </div>
            <div className="auth-field">
              <span className="field-icon"><Lock size={20} /></span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password (min 6 chars)"
                minLength={6}
                required
              />
            </div>
            <div className="auth-field">
              <span className="field-icon"><Lock size={20} /></span>
              <input
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                placeholder="Confirm password"
                minLength={6}
                required
              />
            </div>
            <div className="auth-field">
              <span className="field-icon"><Phone size={20} /></span>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone (optional)"
              />
            </div>
          </div>

          <div className="auth-field">
            <span className="field-icon"><Home size={20} /></span>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Address (optional)"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Create Account →"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>

        <p className="auth-note">
          <University size={20} /> Staff member? Login directly — no registration needed.
        </p>

      </div>
    </div>
  );
}