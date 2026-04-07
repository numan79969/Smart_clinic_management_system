import { useEffect, useState } from "react";

import { apiRequest } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import Layout from "../../components/Layout";

function toInputDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export default function HospitalDashboard() {
  const { token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [slotFilterDoctor, setSlotFilterDoctor] = useState("");
  const [activeTab, setActiveTab] = useState("doctors");

  const [doctorForm, setDoctorForm] = useState({
    full_name: "",
    specialty_id: "",
    experience_years: "0",
    consultation_fee: "",
  });
  const [slotForm, setSlotForm] = useState({
    doctor_id: "",
    slot_date: "",
    start_time: "",
    end_time: "",
  });
  const [statusMap, setStatusMap] = useState({});

  const [documentForm, setDocumentForm] = useState({
    appointment_id: "",
    diagnosis: "",
    advice: "",
    bill_amount: "",
    payment_status: "UNPAID",
    report_type: "Lab",
    prescription_file_url: "",
    report_file_url: "",
  });

  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState("report");
  const [completedActions, setCompletedActions] = useState([]);
  const [completedApptId, setCompletedApptId] = useState("");

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load specialties independently so they always load regardless of other API errors
  useEffect(() => {
    apiRequest("/lookups/specialties")
      .then(setSpecialties)
      .catch(() => setSpecialties([]));
  }, []);

  const loadDashboard = async () => {
    setError("");
    // Profile is required — stop if it fails
    let profileRow;
    try {
      profileRow = await apiRequest("/hospital/profile", { token });
      setProfile(profileRow);
    } catch (err) {
      setError("Could not load hospital profile: " + err.message);
      return;
    }

    // Operational data loads independently — one failure won't block the others
    const [doctorResult, slotResult, apptResult] = await Promise.allSettled([
      apiRequest("/hospital/doctors", { token }),
      apiRequest("/hospital/slots", { token }),
      apiRequest("/hospital/appointments", { token }),
    ]);

    if (doctorResult.status === "fulfilled") setDoctors(doctorResult.value);
    if (slotResult.status === "fulfilled") setSlots(slotResult.value);
    if (apptResult.status === "fulfilled") {
      const appts = apptResult.value;
      setAppointments(appts);
      const statusDefaults = {};
      appts.forEach((item) => {
        statusDefaults[item.appointment_id] = item.appointment_status;
      });
      setStatusMap(statusDefaults);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadDashboard().finally(() => setLoading(false));
  }, []);

  const isApproved = profile?.onboarding_status === "APPROVED";

  const onDoctorChange = (event) => {
    const { name, value } = event.target;
    setDoctorForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSlotChange = (event) => {
    const { name, value } = event.target;
    setSlotForm((prev) => ({ ...prev, [name]: value }));
  };

  const onDocumentChange = (event) => {
    const { name, value } = event.target;
    setDocumentForm((prev) => ({ ...prev, [name]: value }));
  };

  const createDoctor = async (event) => {
    event.preventDefault();
    if (!isApproved) { setError("Hospital must be APPROVED before adding doctors."); return; }
    if (!doctorForm.specialty_id) { setError("Please select a specialty."); return; }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await apiRequest("/hospital/doctors", {
        method: "POST",
        token,
        body: {
          full_name: doctorForm.full_name,
          specialty_id: Number(doctorForm.specialty_id),
          experience_years: Number(doctorForm.experience_years),
          consultation_fee: String(doctorForm.consultation_fee),
          is_active: true,
        },
      });

      setDoctorForm({
        full_name: "",
        specialty_id: "",
        experience_years: "0",
        consultation_fee: "",
      });
      setMessage("Doctor added successfully.");
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const createSlot = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await apiRequest(`/hospital/doctors/${slotForm.doctor_id}/slots`, {
        method: "POST",
        token,
        body: {
          slots: [
            {
              slot_date: slotForm.slot_date,
              start_time: slotForm.start_time,
              end_time: slotForm.end_time,
            },
          ],
        },
      });

      setSlotForm({ doctor_id: "", slot_date: "", start_time: "", end_time: "" });
      if (result.skipped_slots > 0 && result.created_slots === 0) {
        setError("Slot already exists for this doctor at that date and time.");
      } else {
        setMessage(`Slot created successfully.`);
      }
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const updateStatus = async (appointmentId) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await apiRequest(`/hospital/appointments/${appointmentId}/status`, {
        method: "PATCH",
        token,
        body: {
          appointment_status: statusMap[appointmentId],
        },
      });
      setMessage(`Appointment #${appointmentId} updated.`);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const uploadDocument = async (event) => {
    event.preventDefault();
    if (!uploadFile) {
      setError("Please choose a file to upload.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("document_type", uploadType);
      formData.append("file", uploadFile);

      const response = await apiRequest("/hospital/uploads", {
        method: "POST",
        token,
        body: formData,
        isFormData: true,
      });

      if (uploadType === "prescription") {
        setDocumentForm((prev) => ({ ...prev, prescription_file_url: response.file_url }));
      } else {
        setDocumentForm((prev) => ({ ...prev, report_file_url: response.file_url }));
      }
      setMessage(`File uploaded successfully. You can now create a prescription or report using this file.`);
      setUploadFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const createPrescription = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await apiRequest(`/hospital/appointments/${documentForm.appointment_id}/prescriptions`, {
        method: "POST",
        token,
        body: {
          diagnosis: documentForm.diagnosis,
          advice: documentForm.advice,
          file_url: documentForm.prescription_file_url || null,
        },
      });
      const apptId = documentForm.appointment_id;
      const updated = (completedApptId === apptId ? completedActions : []).concat("Prescription");
      setCompletedApptId(apptId);
      setCompletedActions(updated);
      setMessage(`Saved for Appointment #${apptId}: ${updated.join(", ")}`);
      setDocumentForm((prev) => ({ ...prev, diagnosis: "", advice: "", prescription_file_url: "" }));
      alert(`Appointment #${apptId}\n\nCompleted:\n${updated.map((a, i) => `${i + 1}. ${a}`).join("\n")}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const createBill = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await apiRequest(`/hospital/appointments/${documentForm.appointment_id}/bills`, {
        method: "POST",
        token,
        body: {
          total_amount: documentForm.bill_amount,
          payment_status: documentForm.payment_status,
        },
      });
      const apptId = documentForm.appointment_id;
      const updated = (completedApptId === apptId ? completedActions : []).concat(`Bill \u20b9${documentForm.bill_amount}`);
      setCompletedApptId(apptId);
      setCompletedActions(updated);
      setMessage(`Saved for Appointment #${apptId}: ${updated.join(", ")}`);
      setDocumentForm((prev) => ({ ...prev, bill_amount: "", payment_status: "UNPAID" }));
      alert(`Appointment #${apptId}\n\nCompleted:\n${updated.map((a, i) => `${i + 1}. ${a}`).join("\n")}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const createReport = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await apiRequest(`/hospital/appointments/${documentForm.appointment_id}/reports`, {
        method: "POST",
        token,
        body: {
          report_type: documentForm.report_type,
          file_url: documentForm.report_file_url,
        },
      });
      const apptId = documentForm.appointment_id;
      const updated = (completedApptId === apptId ? completedActions : []).concat(`${documentForm.report_type} Report`);
      setCompletedApptId(apptId);
      setCompletedActions(updated);
      setMessage(`Saved for Appointment #${apptId}: ${updated.join(", ")}`);
      setDocumentForm((prev) => ({ ...prev, report_type: "Lab", report_file_url: "" }));
      alert(`Appointment #${apptId}\n\nCompleted:\n${updated.map((a, i) => `${i + 1}. ${a}`).join("\n")}`);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout
      title="Hospital Dashboard"
      subtitle="Manage doctors, slots, appointments, prescriptions and billing."
    >
      {loading && <div className="center-message">Loading hospital workspace...</div>}

      {/* Profile card – always visible after load */}
      {profile && (
        <section className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <p className="chip" style={{ marginBottom: "0.4rem" }}>Hospital Profile</p>
              <h2 style={{ margin: 0 }}>{profile.hospital_name}</h2>
              {(profile.locality_name || profile.city) && (
                <p className="muted" style={{ margin: "0.3rem 0 0" }}>
                  {[profile.locality_name, profile.city].filter(Boolean).join(", ")}
                  {" · "}
                  Reg: {profile.registration_no}
                </p>
              )}
              <p className="muted" style={{ margin: "0.2rem 0 0", fontSize: "0.88rem" }}>
                {profile.email}{profile.contact_phone ? ` · ${profile.contact_phone}` : ""}
              </p>
            </div>
            <span
              style={{
                display: "inline-block",
                padding: "0.3rem 0.9rem",
                borderRadius: "999px",
                fontWeight: 700,
                fontSize: "0.85rem",
                background: isApproved
                  ? "linear-gradient(90deg,#1a8f5a,#0f7048)"
                  : profile.onboarding_status === "REJECTED"
                  ? "linear-gradient(90deg,#dd5656,#b03030)"
                  : "rgba(240,140,43,0.18)",
                color: isApproved ? "#fff" : profile.onboarding_status === "REJECTED" ? "#fff" : "#7a4200",
                border: isApproved ? "none" : "1.5px solid rgba(240,140,43,0.45)",
                alignSelf: "flex-start",
              }}
            >
              {profile.onboarding_status}
            </span>
          </div>

          {profile.onboarding_status === "PENDING" && (
            <div style={{ marginTop: "1rem", background: "rgba(240,140,43,0.1)", border: "1.5px solid rgba(240,140,43,0.4)", borderRadius: "10px", padding: "0.75rem 1rem" }}>
              <strong>⏳ Awaiting Admin Approval</strong>
              <p style={{ margin: "0.3rem 0 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                Your hospital is under review. Once approved, you can add doctors, create appointment slots, and manage records.
              </p>
            </div>
          )}

          {profile.onboarding_status === "REJECTED" && (
            <div style={{ marginTop: "1rem", background: "rgba(207,62,62,0.08)", border: "1.5px solid rgba(207,62,62,0.35)", borderRadius: "10px", padding: "0.75rem 1rem" }}>
              <strong>❌ Registration Rejected</strong>
              <p style={{ margin: "0.3rem 0 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                Your hospital registration was rejected by admin. Please contact support.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Only show operation tabs if APPROVED */}
      {isApproved && (
        <>
          {/* Tab bar */}
          <div className="admin-tabs">
            {[
              { key: "doctors", label: "Doctors" },
              { key: "slots", label: "Slot Calendar" },
              { key: "appointments", label: `Appointments (${appointments.length})` },
              { key: "records", label: "Prescriptions & Billing" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`admin-tab-btn${activeTab === tab.key ? " admin-tab-active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── DOCTORS TAB ── */}
          {activeTab === "doctors" && (
            <section className="card">
              <h2>Add Doctor</h2>
              {specialties.length === 0 && (
                <p className="error-text" style={{ marginBottom: "0.75rem" }}>
                  Specialties could not be loaded. Please refresh the page.
                </p>
              )}
              <form className="grid-four" onSubmit={createDoctor}>
                <label>
                  Doctor Name
                  <input
                    name="full_name"
                    value={doctorForm.full_name}
                    onChange={onDoctorChange}
                    required
                    placeholder="Dr. Ahmed Khan"
                  />
                </label>
                <label>
                  Specialty
                  <select
                    name="specialty_id"
                    value={doctorForm.specialty_id}
                    onChange={onDoctorChange}
                    required
                  >
                    <option value="">-- Select Specialty --</option>
                    {specialties.map((item) => (
                      <option key={item.specialty_id} value={item.specialty_id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Experience (Years)
                  <input
                    name="experience_years"
                    type="number"
                    min="0"
                    max="80"
                    value={doctorForm.experience_years}
                    onChange={onDoctorChange}
                  />
                </label>
                <label>
                  Consultation Fee (PKR)
                  <input
                    name="consultation_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={doctorForm.consultation_fee}
                    onChange={onDoctorChange}
                    required
                    placeholder="500"
                  />
                </label>
                <button
                  className="primary-btn"
                  type="submit"
                  disabled={busy || specialties.length === 0}
                  style={{ gridColumn: "1 / -1" }}
                >
                  {busy ? "Adding..." : "Add Doctor"}
                </button>
              </form>

              <h3 style={{ marginTop: "1.2rem" }}>My Doctors ({doctors.length})</h3>
              {doctors.length === 0 ? (
                <p className="muted">No doctors added yet.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Specialty</th>
                        <th>Experience</th>
                        <th>Fee (PKR)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((d) => (
                        <tr key={d.doctor_id}>
                          <td>{d.doctor_id}</td>
                          <td><strong>{d.full_name}</strong></td>
                          <td>{d.specialty_name}</td>
                          <td>{d.experience_years} yrs</td>
                          <td>{d.consultation_fee}</td>
                          <td>
                            <span style={{ color: d.is_active ? "var(--ok)" : "var(--muted)", fontWeight: 700 }}>
                              {d.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* ── SLOT CALENDAR TAB ── */}
          {activeTab === "slots" && (
            <section className="card">
              <h2>Add Appointment Slot</h2>
              {doctors.length === 0 ? (
                <p className="error-text">Add at least one doctor first before creating slots.</p>
              ) : (
                <form className="grid-four" onSubmit={createSlot}>
                  <label>
                    Doctor
                    <select name="doctor_id" value={slotForm.doctor_id} onChange={onSlotChange} required>
                      <option value="">-- Select Doctor --</option>
                      {doctors.map((d) => (
                        <option key={d.doctor_id} value={d.doctor_id}>
                          {d.full_name} — {d.specialty_name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Date
                    <input
                      type="date"
                      name="slot_date"
                      value={slotForm.slot_date}
                      onChange={onSlotChange}
                      required
                      min={new Date().toISOString().slice(0, 10)}
                    />
                  </label>
                  <label>
                    Start Time
                    <input type="time" name="start_time" value={slotForm.start_time} onChange={onSlotChange} required />
                  </label>
                  <label>
                    End Time
                    <input type="time" name="end_time" value={slotForm.end_time} onChange={onSlotChange} required />
                  </label>
                  <button className="primary-btn" type="submit" disabled={busy} style={{ gridColumn: "1 / -1" }}>
                    {busy ? "Adding..." : "Add Slot"}
                  </button>
                </form>
              )}

              <div className="inline-controls" style={{ marginTop: "1.2rem" }}>
                <label style={{ minWidth: "220px" }}>
                  Filter by Doctor
                  <select value={slotFilterDoctor} onChange={(e) => setSlotFilterDoctor(e.target.value)}>
                    <option value="">All Doctors</option>
                    {doctors.map((d) => (
                      <option key={d.doctor_id} value={String(d.doctor_id)}>
                        {d.full_name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="table-wrap" style={{ marginTop: "0.75rem" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Slot ID</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots
                      .filter((s) => !slotFilterDoctor || String(s.doctor_id) === slotFilterDoctor)
                      .map((s) => (
                        <tr key={s.slot_id}>
                          <td>{s.slot_id}</td>
                          <td>{s.doctor_name}</td>
                          <td>{s.slot_date}</td>
                          <td>{String(s.start_time).slice(0, 5)}</td>
                          <td>{String(s.end_time).slice(0, 5)}</td>
                          <td>
                            <span style={{
                              color: s.slot_status === "AVAILABLE" ? "var(--ok)"
                                : s.slot_status === "BOOKED" ? "var(--accent)"
                                : "var(--muted)",
                              fontWeight: 700,
                            }}>
                              {s.slot_status}
                            </span>
                          </td>
                          <td>
                            {s.slot_status === "AVAILABLE" && (
                              <button
                                className="danger-btn"
                                type="button"
                                disabled={busy}
                                onClick={async () => {
                                  setBusy(true); setError(""); setMessage("");
                                  try {
                                    await apiRequest(`/hospital/slots/${s.slot_id}`, { method: "DELETE", token });
                                    setMessage(`Slot #${s.slot_id} deleted.`);
                                    await loadDashboard();
                                  } catch (err) { setError(err.message); }
                                  finally { setBusy(false); }
                                }}
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    {slots.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: "1rem" }}>
                          No slots yet. Use the form above to create slots.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── APPOINTMENTS TAB ── */}
          {activeTab === "appointments" && (
            <section className="card">
              <h2>Appointment Lifecycle</h2>
              {appointments.length === 0 ? (
                <p className="muted">No appointments booked yet. Patients can book once you have published slots.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Condition</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt.appointment_id}>
                          <td>{appt.appointment_id}</td>
                          <td>{appt.patient_name}</td>
                          <td>{appt.doctor_name}</td>
                          <td>{appt.condition}</td>
                          <td>{toInputDate(appt.slot_date)}</td>
                          <td>{appt.appointment_status}</td>
                          <td>
                            <div className="inline-controls">
                              <select
                                value={statusMap[appt.appointment_id] || appt.appointment_status}
                                onChange={(e) =>
                                  setStatusMap((prev) => ({ ...prev, [appt.appointment_id]: e.target.value }))
                                }
                              >
                                <option value="BOOKED">BOOKED</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                                <option value="NO_SHOW">NO_SHOW</option>
                              </select>
                              <button
                                className="ghost-btn"
                                type="button"
                                onClick={() => updateStatus(appt.appointment_id)}
                                disabled={busy}
                              >
                                Save
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
          )}

          {/* ── PRESCRIPTIONS & BILLING TAB ── */}
          {activeTab === "records" && (
            <section className="card">
              <h2>Prescription, Billing and Report Desk</h2>
              <p className="muted" style={{ marginBottom: "1rem" }}>
                Select an appointment below, then use the sections for each action.
              </p>

              {/* Shared: Appointment ID + File Upload */}
              <div style={{ background: "rgba(17,60,80,0.06)", borderRadius: "12px", padding: "1rem", marginBottom: "1.2rem", border: "1px solid rgba(16,33,45,0.1)" }}>
                <h3 style={{ margin: "0 0 0.6rem", fontSize: "1rem" }}>Step 1 — Select Appointment &amp; Upload File</h3>
                <div className="grid-four">
                  <label>
                    Appointment
                    <select name="appointment_id" value={documentForm.appointment_id} onChange={onDocumentChange}>
                      <option value="">-- Select Appointment --</option>
                      {appointments.map((appt) => (
                        <option key={appt.appointment_id} value={appt.appointment_id}>
                          #{appt.appointment_id} — {appt.patient_name} ({appt.doctor_name}, {appt.appointment_status})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Upload Type
                    <select value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
                      <option value="report">Report</option>
                      <option value="prescription">Prescription</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label>
                    Choose File
                    <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
                  </label>
                  <button className="primary-btn" type="button" disabled={busy} style={{ alignSelf: "end" }} onClick={uploadDocument}>
                    {busy ? "Uploading..." : "Upload File"}
                  </button>
                </div>
                {(documentForm.prescription_file_url || documentForm.report_file_url) && (
                  <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--ok)", fontWeight: 700 }}>
                    ✓ File ready: {uploadType === "prescription" ? documentForm.prescription_file_url : documentForm.report_file_url}
                  </p>
                )}
              </div>

              {/* Three clear action cards side by side */}
              <div className="grid-three">
                {/* Prescription Card */}
                <div style={{ background: "rgba(17,144,111,0.06)", borderRadius: "12px", padding: "1rem", border: "1px solid rgba(17,144,111,0.2)" }}>
                  <h3 style={{ margin: "0 0 0.6rem", fontSize: "1rem", color: "#11906f" }}>Create Prescription</h3>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Diagnosis
                    <input name="diagnosis" value={documentForm.diagnosis} onChange={onDocumentChange} placeholder="e.g. Viral Fever" />
                  </label>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Advice / Notes
                    <input name="advice" value={documentForm.advice} onChange={onDocumentChange} placeholder="Rest and fluids..." />
                  </label>
                  <label style={{ display: "block", marginBottom: "0.7rem" }}>
                    <span className="muted" style={{ fontSize: "0.82rem" }}>File URL (auto-filled after upload)</span>
                    <input name="prescription_file_url" value={documentForm.prescription_file_url} onChange={onDocumentChange} placeholder="/uploads/..." readOnly style={{ opacity: 0.7 }} />
                  </label>
                  <button className="primary-btn" type="button" onClick={createPrescription} disabled={busy || !documentForm.appointment_id || !documentForm.diagnosis} style={{ width: "100%" }}>
                    {busy ? "Saving..." : "Save Prescription"}
                  </button>
                </div>

                {/* Bill Card */}
                <div style={{ background: "rgba(240,140,43,0.06)", borderRadius: "12px", padding: "1rem", border: "1px solid rgba(240,140,43,0.2)" }}>
                  <h3 style={{ margin: "0 0 0.6rem", fontSize: "1rem", color: "#b07020" }}>Generate Bill</h3>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Bill Amount (PKR)
                    <input name="bill_amount" type="number" min="0" step="0.01" value={documentForm.bill_amount} onChange={onDocumentChange} placeholder="500.00" />
                  </label>
                  <label style={{ display: "block", marginBottom: "0.7rem" }}>
                    Payment Status
                    <select name="payment_status" value={documentForm.payment_status} onChange={onDocumentChange} style={{ width: "100%" }}>
                      <option value="UNPAID">UNPAID</option>
                      <option value="PARTIAL">PARTIAL</option>
                      <option value="PAID">PAID</option>
                    </select>
                  </label>
                  <button className="ghost-btn" type="button" onClick={createBill} disabled={busy || !documentForm.appointment_id || !documentForm.bill_amount} style={{ width: "100%", background: "rgba(240,140,43,0.15)", fontWeight: 700 }}>
                    {busy ? "Generating..." : "Generate Bill"}
                  </button>
                </div>

                {/* Report Card */}
                <div style={{ background: "rgba(17,109,143,0.06)", borderRadius: "12px", padding: "1rem", border: "1px solid rgba(17,109,143,0.2)" }}>
                  <h3 style={{ margin: "0 0 0.6rem", fontSize: "1rem", color: "#116d8f" }}>Upload Report</h3>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Report Type
                    <input name="report_type" value={documentForm.report_type} onChange={onDocumentChange} placeholder="Lab / X-Ray / MRI" />
                  </label>
                  <label style={{ display: "block", marginBottom: "0.7rem" }}>
                    <span className="muted" style={{ fontSize: "0.82rem" }}>File URL (auto-filled after upload)</span>
                    <input name="report_file_url" value={documentForm.report_file_url} onChange={onDocumentChange} placeholder="/uploads/..." readOnly style={{ opacity: 0.7 }} />
                  </label>
                  <button className="ghost-btn" type="button" onClick={createReport} disabled={busy || !documentForm.appointment_id || !documentForm.report_file_url} style={{ width: "100%", background: "rgba(17,109,143,0.15)", fontWeight: 700 }}>
                    {busy ? "Uploading..." : "Upload Report"}
                  </button>
                </div>
              </div>

              {error && <p className="error-text" style={{ marginTop: "0.75rem" }}>{error}</p>}
              {message && <p className="success-text" style={{ marginTop: "0.75rem" }}>{message}</p>}
            </section>
          )}
        </>
      )}

      {error && <p className="error-text" style={{ marginTop: "0.75rem" }}>{error}</p>}
      {message && <p className="success-text" style={{ marginTop: "0.75rem" }}>{message}</p>}
    </Layout>
  );
}
