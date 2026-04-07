import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

function roleLabel(role) {
  if (role === "PATIENT") return "Patient";
  if (role === "HOSPITAL") return "Hospital";
  if (role === "ADMIN") return "Admin";
  return "Guest";
}

function rolePath(role) {
  if (role === "PATIENT") return "/patient";
  if (role === "HOSPITAL") return "/hospital";
  if (role === "ADMIN") return "/admin";
  return "/login";
}

export default function Layout({ title, subtitle, children }) {
  const { account, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="page-wrap">
      <header className="shell-header">
        <div>
          <p className="chip">Smart Clinic Management System</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="header-right">
          <p>
            Signed in as <strong>{account?.email}</strong>
          </p>
          <p className="muted">Role: {roleLabel(account?.role)}</p>
          <div className="header-actions">
            <Link className="ghost-btn" to={rolePath(account?.role)}>
              Dashboard Home
            </Link>
            <button className="danger-btn" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
