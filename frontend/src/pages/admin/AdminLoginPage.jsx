import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, account } = useAuth();
  const [email, setEmail] = useState("admin@scms.app");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && account?.role === "ADMIN") {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, account, navigate]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const nextAccount = await login(email, password);
      if (nextAccount.role !== "ADMIN") {
        setError("This portal is for Admin accounts only. Please use the main login page.");
        return;
      }
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card admin-login-card">
        {/* Shield badge */}
        <div className="admin-badge">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2L3 6.5v5C3 16.09 6.84 20.5 12 22c5.16-1.5 9-5.91 9-10.5v-5L12 2z"
              fill="#f08c2b"
              opacity="0.18"
              stroke="#f08c2b"
              strokeWidth="1.5"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="#f08c2b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="chip">Admin Access</p>
        <h1>Admin Portal</h1>
        <p className="muted">
          Approve hospitals, manage users, and oversee platform activity.
        </p>

        {/* Credentials hint */}
        <div className="admin-hint-box">
          <strong>Default credentials</strong>
          <div className="admin-hint-row">
            <span>Email</span>
            <code>admin@scms.app</code>
          </div>
          <div className="admin-hint-row">
            <span>Password</span>
            <code>Admin@12345</code>
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid-two">
          <label>
            Admin Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="current-password"
              placeholder="Admin@12345"
            />
          </label>
          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
            style={{ gridColumn: "1 / -1" }}
          >
            {loading ? "Authenticating..." : "Sign in as Admin"}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}

        <div className="auth-links" style={{ marginTop: "1rem" }}>
          <Link to="/login">← Back to main login</Link>
        </div>
      </div>
    </div>
  );
}
