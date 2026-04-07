import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

function rolePath(role) {
  if (role === "PATIENT") return "/patient";
  if (role === "HOSPITAL") return "/hospital";
  if (role === "ADMIN") return "/admin";
  return "/";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, account } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && account) {
      navigate(rolePath(account.role), { replace: true });
    }
  }, [isAuthenticated, account, navigate]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const nextAccount = await login(email, password);
      navigate(rolePath(nextAccount.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <p className="chip">Secure Access</p>
        <h1>Smart Clinic Control Center</h1>
        <p className="muted">
          Sign in to manage appointments, doctors, records, billing, and platform oversight.
        </p>
        <form onSubmit={onSubmit} className="grid-two">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </label>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
        <div className="auth-links">
          <Link to="/register/patient">New patient registration</Link>
          <Link to="/register/hospital">Hospital onboarding request</Link>
        </div>
        <div className="admin-portal-link">
          <Link to="/admin/login" className="admin-portal-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{verticalAlign:"middle",marginRight:"6px"}}>
              <path d="M12 2L3 6.5v5C3 16.09 6.84 20.5 12 22c5.16-1.5 9-5.91 9-10.5v-5L12 2z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
