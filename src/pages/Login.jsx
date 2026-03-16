import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, memberLogin } from "../api";
import { BookOpen, User, Lock, Mail, Book } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
      return;
    } catch {}
    try {
      await memberLogin(form.email, form.password);
      navigate("/member/dashboard");
      return;
    } catch {
      setError("Invalid email or password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-scene">
      <div className={`auth-float-card ${mounted ? "visible" : ""}`}>

        <div className="auth-logo-wrap">
          <div className="auth-logo-circle"><BookOpen size={26} color="white" /></div>
        </div>

        <h1 className="auth-headline">LibraryMS</h1>
        <p className="auth-tagline">Your gateway to knowledge</p>

        {error && <div className="auth-alert">{error}</div>}

        <form className="auth-form-inner" onSubmit={handleSubmit}>
          <div className="auth-field">
            <span className="field-icon"><Mail size={20} /></span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              required
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <span className="field-icon"><Lock size={20} /></span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
          </div>

          <div className="auth-forgot-wrap">
            <Link to="/forgot-password" className="auth-link auth-link--small">
              Forgot password?
            </Link>
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Sign In →"}
          </button>
        </form>

        <p className="auth-footer-text">
          New to LibraryMS?{" "}
          <Link to="/register" className="auth-link">
            Create an account
          </Link>
        </p>

        <div className="auth-badges">
          <span className="auth-badge"><Book size={20} /> Staff</span>
          <span className="auth-badge"><User size={20} /> Members</span>
          <span className="auth-badge"><Lock size={20} /> Secure</span>
        </div>

      </div>
    </div>
  );
}