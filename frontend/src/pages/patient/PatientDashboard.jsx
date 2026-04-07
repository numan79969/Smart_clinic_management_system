import { useEffect, useState } from "react";

import { apiRequest, toAssetUrl } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import Layout from "../../components/Layout";

function toInputDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export default function PatientDashboard() {
  const { token, account } = useAuth();
  const [localities, setLocalities] = useState([]);
  const [conditions, setConditions] = useState([]);

  const [localityId, setLocalityId] = useState("");
  const [conditionId, setConditionId] = useState("");

  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  const [slotDate, setSlotDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState({
    prescriptions: [],
    bills: [],
    reports: [],
  });
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadLookups = async () => {
    const [localityRows, conditionRows] = await Promise.all([
      apiRequest("/lookups/localities"),
      apiRequest("/lookups/conditions"),
    ]);
    setLocalities(localityRows);
    setConditions(conditionRows);
  };

  const loadPatientData = async () => {
    const [appointmentResult, documentResult, notificationResult] = await Promise.allSettled([
      apiRequest("/patient/appointments", { token }),
      apiRequest("/patient/documents", { token }),
      apiRequest("/patient/notifications", { token }),
    ]);

    if (appointmentResult.status === "fulfilled") {
      setAppointments(appointmentResult.value);
    }
    if (documentResult.status === "fulfilled") {
      setDocuments(documentResult.value);
    }
    if (notificationResult.status === "fulfilled") {
      setNotifications(notificationResult.value);
    }

    const firstError = [appointmentResult, documentResult, notificationResult].find(
      (r) => r.status === "rejected",
    );
    if (firstError) {
      setError(firstError.reason?.message ?? "Failed to load some data");
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([loadLookups(), loadPatientData()]).finally(() => setLoading(false));
  }, []);

  const searchHospitals = async () => {
    setError("");
    setMessage("");

    try {
      const query = new URLSearchParams();
      if (localityId) query.set("locality_id", localityId);
      if (conditionId) query.set("condition_id", conditionId);

      const rows = await apiRequest(`/discovery/hospitals?${query.toString()}`);
      setHospitals(rows);
      setSelectedHospital(null);
      setDoctors([]);
      setSlots([]);
      setSelectedDoctorId("");
      setSelectedSlotId("");

      if (!rows.length) {
        setMessage("No hospitals matched your filters.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadDoctors = async (hospital) => {
    setSelectedHospital(hospital);
    setSelectedDoctorId("");
    setSelectedSlotId("");
    setSlots([]);
    setError("");

    try {
      const query = new URLSearchParams();
      if (conditionId) query.set("condition_id", conditionId);

      const rows = await apiRequest(
        `/discovery/hospitals/${hospital.hospital_id}/doctors?${query.toString()}`,
      );
      setDoctors(rows);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadSlots = async (doctorId, dateValue = "") => {
    setSelectedDoctorId(String(doctorId));
    setSelectedSlotId("");
    setError("");

    try {
      const query = new URLSearchParams();
      if (dateValue) query.set("slot_date", dateValue);

      const rows = await apiRequest(`/discovery/doctors/${doctorId}/slots?${query.toString()}`);
      setSlots(rows);
    } catch (err) {
      setError(err.message);
    }
  };

  const bookAppointment = async () => {
    setError("");
    setMessage("");

    if (!conditionId) {
      setError("Please select a medical condition first.");
      return;
    }
    if (!selectedDoctorId || !selectedSlotId) {
      setError("Please select a doctor and slot.");
      return;
    }

    setBusy(true);
    try {
      const response = await apiRequest("/patient/appointments", {
        method: "POST",
        token,
        body: {
          doctor_id: Number(selectedDoctorId),
          slot_id: Number(selectedSlotId),
          condition_id: Number(conditionId),
        },
      });

      setMessage(`Appointment #${response.appointment_id} booked successfully.`);
      await loadPatientData();
      await loadSlots(selectedDoctorId, slotDate);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/patient/appointments/${appointmentId}/cancel`, {
        method: "PATCH",
        token,
      });
      await loadPatientData();
      if (selectedDoctorId) {
        await loadSlots(selectedDoctorId, slotDate);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const markRead = async (notificationId) => {
    try {
      await apiRequest(`/patient/notifications/${notificationId}/read`, {
        method: "PATCH",
        token,
      });
      await loadPatientData();
    } catch {
      // Silent update failure keeps UX smooth for optional action.
    }
  };

  return (
    <Layout
      title="Patient Dashboard"
      subtitle="Discover hospitals by locality and condition, book doctor slots, and download visit documents."
    >
      {loading ? <div className="center-message">Loading patient workspace...</div> : null}

      <section className="card">
        <h2>Find Hospitals and Doctors</h2>
        <div className="grid-three">
          <label>
            Locality
            <select value={localityId} onChange={(event) => setLocalityId(event.target.value)}>
              <option value="">All localities</option>
              {localities.map((item) => (
                <option key={item.locality_id} value={item.locality_id}>
                  {item.name} ({item.city})
                </option>
              ))}
            </select>
          </label>
          <label>
            Medical Condition
            <select value={conditionId} onChange={(event) => setConditionId(event.target.value)}>
              <option value="">Select condition</option>
              {conditions.map((item) => (
                <option key={item.condition_id} value={item.condition_id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-btn" type="button" onClick={searchHospitals}>
            Search Hospitals
          </button>
        </div>

        <div className="list-grid">
          {hospitals.map((hospital) => (
            <button
              key={hospital.hospital_id}
              type="button"
              className={`tile ${
                selectedHospital?.hospital_id === hospital.hospital_id ? "tile-active" : ""
              }`}
              onClick={() => loadDoctors(hospital)}
            >
              <h3>{hospital.hospital_name}</h3>
              <p>
                {hospital.locality}, {hospital.city}
              </p>
              <p className="muted">Doctors available: {hospital.doctors_count}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Doctors and Slots</h2>
        <div className="list-grid">
          {doctors.map((doctor) => (
            <button
              key={doctor.doctor_id}
              type="button"
              className={`tile ${selectedDoctorId === String(doctor.doctor_id) ? "tile-active" : ""}`}
              onClick={() => loadSlots(doctor.doctor_id, slotDate)}
            >
              <h3>{doctor.full_name}</h3>
              <p>{doctor.specialty_name}</p>
              <p className="muted">
                {doctor.experience_years} years | Fee PKR {doctor.consultation_fee}
              </p>
            </button>
          ))}
        </div>

        <div className="grid-three">
          <label>
            Slot Date (optional)
            <input
              type="date"
              value={slotDate}
              onChange={(event) => {
                const nextDate = event.target.value;
                setSlotDate(nextDate);
                if (selectedDoctorId) {
                  loadSlots(selectedDoctorId, nextDate);
                }
              }}
            />
          </label>
          <label>
            Available Slots
            <select
              value={selectedSlotId}
              onChange={(event) => setSelectedSlotId(event.target.value)}
            >
              <option value="">Select slot</option>
              {slots.map((slot) => (
                <option key={slot.slot_id} value={slot.slot_id}>
                  {toInputDate(slot.slot_date)} {String(slot.start_time).slice(0, 5)} -{" "}
                  {String(slot.end_time).slice(0, 5)}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-btn" type="button" disabled={busy} onClick={bookAppointment}>
            {busy ? "Submitting..." : "Book Appointment"}
          </button>
        </div>
        {error && <p className="error-text" style={{ marginTop: "0.75rem" }}>{error}</p>}
        {message && <p className="success-text" style={{ marginTop: "0.75rem" }}>{message}</p>}
      </section>

      <section className="card">
        <h2>Appointment Lifecycle</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Hospital</th>
                <th>Doctor</th>
                <th>Condition</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.appointment_id}>
                  <td>{appointment.appointment_id}</td>
                  <td>{appointment.hospital_name}</td>
                  <td>{appointment.doctor_name}</td>
                  <td>{appointment.condition}</td>
                  <td>{toInputDate(appointment.slot_date)}</td>
                  <td>{appointment.appointment_status}</td>
                  <td>
                    {(appointment.appointment_status === "BOOKED" ||
                      appointment.appointment_status === "CONFIRMED") && (
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => cancelAppointment(appointment.appointment_id)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Document Download Center
          <button
            className="ghost-btn"
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const result = await apiRequest("/patient/documents", { token });
                setDocuments(result);
              } catch (err) {
                setError(err.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Refreshing..." : "Refresh"}
          </button>
        </h2>
        <div className="grid-three">
          <div>
            <h3>Prescriptions</h3>
            {documents.prescriptions.map((item) => (
              <p key={item.prescription_id}>
                #{item.prescription_id} - {item.diagnosis} {" "}
                {item.file_url ? (
                  <a href={toAssetUrl(item.file_url)} target="_blank" rel="noreferrer">
                    Open
                  </a>
                ) : (
                  <span className="muted">No file</span>
                )}
              </p>
            ))}
          </div>
          <div>
            <h3>Bills</h3>
            {documents.bills.map((item) => (
              <p key={item.bill_id}>
                Bill #{item.bill_id} - PKR {item.total_amount} ({item.payment_status})
              </p>
            ))}
          </div>
          <div>
            <h3>Reports</h3>
            {documents.reports.map((item) => (
              <p key={item.report_id}>
                #{item.report_id} - {item.report_type} {" "}
                <a href={toAssetUrl(item.file_url)} target="_blank" rel="noreferrer">
                  Open
                </a>
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Notifications</h2>
        {notifications.map((item) => (
          <div className="notice" key={item.notification_id}>
            <p>{item.message}</p>
            <p className="muted">{new Date(item.created_at).toLocaleString()}</p>
            {!item.is_read ? (
              <button className="ghost-btn" type="button" onClick={() => markRead(item.notification_id)}>
                Mark Read
              </button>
            ) : (
              <span className="chip">Read</span>
            )}
          </div>
        ))}
      </section>

      <p className="muted small-text">Logged in as {account?.email}</p>
    </Layout>
  );
}
