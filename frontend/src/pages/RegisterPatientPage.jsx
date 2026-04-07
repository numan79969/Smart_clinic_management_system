import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiRequest } from "../api/client";

export default function RegisterPatientPage() {
  const navigate = useNavigate();
  const [localities, setLocalities] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    dob: "",
    locality_id: "",
    address_line: "",
    emergency_contact: "",
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
      await apiRequest("/auth/register/patient", {
        method: "POST",
        body: {
          ...form,
          dob: form.dob || null,
          locality_id: form.locality_id ? Number(form.locality_id) : null,
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
        <p className="chip">Patient Enrollment</p>
        <h1>Create Patient Account</h1>
        <form onSubmit={onSubmit} className="grid-two">
          <label>
            Full name
            <input name="full_name" value={form.full_name} onChange={onChange} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={onChange} required />
          </label>
          <label>
            Phone
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
          <label>
            Date of birth
            <input name="dob" type="date" value={form.dob} onChange={onChange} />
          </label>
          <label>
            Gender
            <select name="gender" value={form.gender} onChange={onChange}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label>
            Locality
            <select name="locality_id" value={form.locality_id} onChange={onChange}>
              <option value="">Select locality</option>
              {localities.map((item) => (
                <option key={item.locality_id} value={item.locality_id}>
                  {item.name} ({item.city})
                </option>
              ))}
            </select>
          </label>
          <label>
            Emergency contact
            <input name="emergency_contact" value={form.emergency_contact} onChange={onChange} />
          </label>
          <label className="span-two">
            Address line
            <input name="address_line" value={form.address_line} onChange={onChange} />
          </label>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create Patient Account"}
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
