import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./auth/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterHospitalPage from "./pages/RegisterHospitalPage";
import RegisterPatientPage from "./pages/RegisterPatientPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";

function roleHome(role) {
  if (role === "PATIENT") return "/patient";
  if (role === "HOSPITAL") return "/hospital";
  if (role === "ADMIN") return "/admin";
  return "/login";
}

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, account, loading } = useAuth();

  if (loading) {
    return <div className="center-message">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(account.role)) {
    return <Navigate to={roleHome(account.role)} replace />;
  }

  return children;
}

function RootRedirect() {
  const { isAuthenticated, account, loading } = useAuth();

  if (loading) {
    return <div className="center-message">Preparing dashboard...</div>;
  }

  return <Navigate to={isAuthenticated ? roleHome(account.role) : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/patient" element={<RegisterPatientPage />} />
      <Route path="/register/hospital" element={<RegisterHospitalPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={["PATIENT"]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospital"
        element={
          <ProtectedRoute allowedRoles={["HOSPITAL"]}>
            <HospitalDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
