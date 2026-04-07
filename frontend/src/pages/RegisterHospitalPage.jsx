import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiRequest } from "../api/client";

export default function RegisterHospitalPage() {
  const navigate = useNavigate();
  const [localities, setLocalities] = useState([]);
  const [form, setForm] = useState({
    hospital_name: "",
    registration_no: "",
    locality_id: "",
    contact_phone: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/lookups/localities")
      .then(setLocalities)
      .catch(() => setLocalities([]));
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiRequest("/auth/register/hospital", {
        method: "POST",
        body: {
          ...form,
          locality_id: Number(form.locality_id),
        },
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card wide-card">
        <p className="chip">Hospital Onboarding</p>
        <h1>Create Hospital Account</h1>
        <p className="muted">Your account will be activated after admin approval.</p>
        <form onSubmit={onSubmit} className="grid-two">
          <label>
            Hospital name
            <input name="hospital_name" value={form.hospital_name} onChange={onChange} required />
          </label>
          <label>
            Registration number
            <input name="registration_no" value={form.registration_no} onChange={onChange} required />
          </label>
          <label>
            Locality
            <select
              name="locality_id"
              value={form.locality_id}
              onChange={onChange}
              required
            >
              <option value="">Select locality</option>
              {localities.map((item) => (
                <option key={item.locality_id} value={item.locality_id}>
                  {item.name} ({item.city})
                </option>
              ))}
            </select>
          </label>
          <label>
            Contact phone
            <input name="contact_phone" value={form.contact_phone} onChange={onChange} required />
          </label>
          <label>
            Login email
            <input name="email" type="email" value={form.email} onChange={onChange} required />
          </label>
          <label>
            Login phone
            <input name="phone" value={form.phone} onChange={onChange} required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              required
              minLength={8}
            />
          </label>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Hospital Registration"}
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
