import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { BookOpen, Lock, CheckCircle } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function ResetPassword() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
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
      await axios.post(`${API}/auth/reset-password/${uidb64}/${token}/`, {
        password: form.password,
        confirm_password: form.confirm_password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-scene">
      <div className={`auth-float-card ${mounted ? "visible" : ""}`}>

        <div className="auth-logo-wrap">
          <div className="auth-logo-circle"><BookOpen size={26} color="white" /></div>
        </div>

        {success ? (
          <div className="auth-success-block">
            <div className="auth-success-icon"><CheckCircle size={48} color="#22c55e" /></div>
            <h1 className="auth-headline">Password Reset!</h1>
            <p className="auth-tagline">
              Your password has been reset successfully. Redirecting you to sign in...
            </p>
            <Link to="/login" className="auth-submit" style={{ display: "block", textAlign: "center", marginTop: 24 }}>
              Sign In Now →
            </Link>
          </div>
        ) : (
          <>
            <h1 className="auth-headline">Reset Password</h1>
            <p className="auth-tagline">Enter your new password below.</p>

            {error && <div className="auth-alert">{error}</div>}

            <form className="auth-form-inner" onSubmit={handleSubmit}>
              <div className="auth-field">
                <span className="field-icon"><Lock size={20} /></span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="New password (min 6 chars)"
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
                  placeholder="Confirm new password"
                  minLength={6}
                  required
                />
              </div>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : "Reset Password →"}
              </button>
            </form>

            <p className="auth-footer-text">
              <Link to="/login" className="auth-link">Back to Sign In</Link>
            </p>
          </>
        )}

      </div>
    </div>
  );
}