import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Mail, ArrowLeft } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password/`, { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
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
            <div className="auth-success-icon">📧</div>
            <h1 className="auth-headline">Check your email</h1>
            <p className="auth-tagline">
              If that email is registered, you'll receive a password reset link shortly.
            </p>
            <Link to="/login" className="auth-submit" style={{ display: "block", textAlign: "center", marginTop: 24 }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="auth-headline">Forgot Password?</h1>
            <p className="auth-tagline">Enter your email and we'll send you a reset link.</p>

            {error && <div className="auth-alert">{error}</div>}

            <form className="auth-form-inner" onSubmit={handleSubmit}>
              <div className="auth-field">
                <span className="field-icon"><Mail size={20} /></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  autoComplete="email"
                />
              </div>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : "Send Reset Link →"}
              </button>
            </form>

            <p className="auth-footer-text">
              <Link to="/login" className="auth-link">
                <ArrowLeft size={14} style={{ display: "inline", marginRight: 4 }} />
                Back to Sign In
              </Link>
            </p>
          </>
        )}

      </div>
    </div>
  );
}