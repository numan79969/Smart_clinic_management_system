import { useEffect, useState } from "react";

import { apiRequest } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import Layout from "../../components/Layout";

const TABS = ["approvals", "users", "audit"];

export default function AdminDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("approvals");
  const [overview, setOverview] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [hospitalStatusMap, setHospitalStatusMap] = useState({});
  const [roleFilter, setRoleFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    const query = roleFilter ? `?role=${roleFilter}` : "";
    const [overviewRow, accountRows, hospitalRows, logRows] = await Promise.all([
      apiRequest("/admin/overview", { token }),
      apiRequest(`/admin/accounts${query}`, { token }),
      apiRequest("/admin/hospitals", { token }),
      apiRequest("/admin/audit-logs?limit=150", { token }),
    ]);

    setOverview(overviewRow);
    setAccounts(accountRows);
    setHospitals(hospitalRows);
    setAuditLogs(logRows);

    const statusSeed = {};
    hospitalRows.forEach((item) => {
      statusSeed[item.hospital_id] = item.onboarding_status;
    });
    setHospitalStatusMap(statusSeed);
  };

  useEffect(() => {
    setLoading(true);
    loadDashboard()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  const toggleAccount = async (accountId, isActive) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await apiRequest(`/admin/accounts/${accountId}/active`, {
        method: "PATCH",
        token,
        body: { is_active: !isActive },
      });
      setMessage(`Account #${accountId} ${isActive ? "deactivated" : "activated"}.`);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const approveHospital = async (hospitalId) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await apiRequest(`/admin/hospitals/${hospitalId}/onboarding-status`, {
        method: "PATCH",
        token,
        body: { onboarding_status: "APPROVED" },
      });
      setMessage(`Hospital #${hospitalId} has been APPROVED.`);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const rejectHospital = async (hospitalId) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await apiRequest(`/admin/hospitals/${hospitalId}/onboarding-status`, {
        method: "PATCH",
        token,
        body: { onboarding_status: "REJECTED" },
      });
      setMessage(`Hospital #${hospitalId} has been REJECTED.`);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const pendingHospitals = hospitals.filter((h) => h.onboarding_status === "PENDING");
  const approvedHospitals = hospitals.filter((h) => h.onboarding_status === "APPROVED");
  const rejectedHospitals = hospitals.filter((h) => h.onboarding_status === "REJECTED");

  return (
    <Layout
      title="Admin Governance Panel"
      subtitle="Approve hospitals, manage users, and review audit trails."
    >
      {loading ? <div className="center-message">Loading admin data...</div> : null}

      {/* Overview Stats */}
      {overview ? (
        <section className="card">
          <h2>Platform Overview</h2>
          <div className="stats-grid">
            <div className="stat-card"><span>Accounts</span><strong>{overview.accounts}</strong></div>
            <div className="stat-card"><span>Patients</span><strong>{overview.patients}</strong></div>
            <div className="stat-card"><span>Hospitals</span><strong>{overview.hospitals}</strong></div>
            <div className="stat-card"><span>Doctors</span><strong>{overview.doctors}</strong></div>
            <div className="stat-card"><span>Appointments</span><strong>{overview.appointments}</strong></div>
            <div className="stat-card">
              <span>Bills / Reports</span>
              <strong>{overview.bills} / {overview.reports}</strong>
            </div>
          </div>
        </section>
      ) : null}

      {/* Tab Bar */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === "approvals" ? "admin-tab-active" : ""}`}
          onClick={() => setActiveTab("approvals")}
          type="button"
        >
          Hospital Approvals
          {pendingHospitals.length > 0 && (
            <span className="pending-badge">{pendingHospitals.length}</span>
          )}
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "users" ? "admin-tab-active" : ""}`}
          onClick={() => setActiveTab("users")}
          type="button"
        >
          User Control
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "audit" ? "admin-tab-active" : ""}`}
          onClick={() => setActiveTab("audit")}
          type="button"
        >
          Audit Trail
        </button>
      </div>

      {/* === HOSPITAL APPROVALS TAB === */}
      {activeTab === "approvals" && (
        <>
          {/* Pending */}
          <section className="card">
            <h2>
              Pending Approvals
              {pendingHospitals.length > 0 && (
                <span className="pending-badge" style={{ marginLeft: "0.6rem", fontSize: "0.85rem" }}>
                  {pendingHospitals.length} waiting
                </span>
              )}
            </h2>
            {pendingHospitals.length === 0 ? (
              <p className="muted">No pending hospital requests.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Hospital Name</th>
                      <th>Reg. No</th>
                      <th>Location</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingHospitals.map((h) => (
                      <tr key={h.hospital_id}>
                        <td>{h.hospital_id}</td>
                        <td><strong>{h.hospital_name}</strong></td>
                        <td>{h.registration_no}</td>
                        <td>{h.locality}, {h.city}</td>
                        <td>{h.email}</td>
                        <td>
                          <div className="button-row">
                            <button
                              className="primary-btn"
                              type="button"
                              disabled={busy}
                              onClick={() => approveHospital(h.hospital_id)}
                              style={{ background: "linear-gradient(90deg,#1a8f5a,#0f7048)" }}
                            >
                              ✓ Approve
                            </button>
                            <button
                              className="danger-btn"
                              type="button"
                              disabled={busy}
                              onClick={() => rejectHospital(h.hospital_id)}
                            >
                              ✗ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Approved */}
          <section className="card">
            <h2>Approved Hospitals</h2>
            {approvedHospitals.length === 0 ? (
              <p className="muted">No approved hospitals yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Hospital Name</th>
                      <th>Reg. No</th>
                      <th>Location</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedHospitals.map((h) => (
                      <tr key={h.hospital_id}>
                        <td>{h.hospital_id}</td>
                        <td>{h.hospital_name}</td>
                        <td>{h.registration_no}</td>
                        <td>{h.locality}, {h.city}</td>
                        <td>
                          <button
                            className="danger-btn"
                            type="button"
                            disabled={busy}
                            onClick={() => rejectHospital(h.hospital_id)}
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Rejected */}
          {rejectedHospitals.length > 0 && (
            <section className="card">
              <h2>Rejected Hospitals</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Hospital Name</th>
                      <th>Location</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejectedHospitals.map((h) => (
                      <tr key={h.hospital_id}>
                        <td>{h.hospital_id}</td>
                        <td>{h.hospital_name}</td>
                        <td>{h.locality}, {h.city}</td>
                        <td>
                          <button
                            className="primary-btn"
                            type="button"
                            disabled={busy}
                            onClick={() => approveHospital(h.hospital_id)}
                            style={{ background: "linear-gradient(90deg,#1a8f5a,#0f7048)" }}
                          >
                            Re-Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      {/* === USER CONTROL TAB === */}
      {activeTab === "users" && (
        <section className="card">
          <h2>User Control</h2>
          <div className="inline-controls">
            <label>
              Role Filter
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">All</option>
                <option value="PATIENT">PATIENT</option>
                <option value="HOSPITAL">HOSPITAL</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Role</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((item) => (
                  <tr key={item.account_id}>
                    <td>{item.account_id}</td>
                    <td>{item.role}</td>
                    <td>{item.display_name || "-"}</td>
                    <td>{item.email}</td>
                    <td>{item.phone}</td>
                    <td>
                      <span style={{ color: item.is_active ? "var(--ok)" : "var(--error)", fontWeight: 700 }}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={item.is_active ? "danger-btn" : "primary-btn"}
                        type="button"
                        disabled={busy}
                        onClick={() => toggleAccount(item.account_id, item.is_active)}
                        style={!item.is_active ? { background: "linear-gradient(90deg,#1a8f5a,#0f7048)" } : {}}
                      >
                        {item.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* === AUDIT TRAIL TAB === */}
      {activeTab === "audit" && (
        <section className="card">
          <h2>Audit Trail</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.log_id}>
                    <td>{log.log_id}</td>
                    <td>{log.actor_account_id ?? "system"}</td>
                    <td>{log.action}</td>
                    <td>{log.entity_name}</td>
                    <td>{log.entity_id ?? "-"}</td>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}
    </Layout>
  );
}

