import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./hooks/useAuth";
import { academicApi } from "./services/academicService";
import "./App.css";

export default function App() {
  const { user, loading, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [modal, setModal] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [formAdvisor, setFormAdvisor] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 4000); };

  const loadData = useCallback(async () => {
    setLoadingData(true); setError("");
    try {
      const [profRes, schedRes, apptRes] = await Promise.allSettled([
        academicApi.getProfile(), academicApi.getSchedule(), academicApi.getAppointments(),
      ]);
      setProfile(profRes.status === "fulfilled" ? profRes.value : null);
      setSchedule(schedRes.status === "fulfilled" && Array.isArray(schedRes.value) ? schedRes.value : []);
      setAppointments(apptRes.status === "fulfilled" && Array.isArray(apptRes.value) ? apptRes.value : []);
    } catch { setError("Failed to connect to Academic Support Service."); }
    finally { setLoadingData(false); }
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const handleBook = async (e) => {
    e.preventDefault(); if (!formAdvisor.trim() || !formDate) return;
    setFormSubmitting(true);
    try {
      await academicApi.bookAdvisor({ advisor_name: formAdvisor.trim(), date: formDate });
      showSuccess("Appointment booked with " + formAdvisor + " on " + fmtDate(formDate));
      closeModal(); await loadData();
    } catch (err) { setError(err?.message || "Failed to book appointment."); }
    finally { setFormSubmitting(false); }
  };

  const handleReschedule = async (e) => {
    e.preventDefault(); if (!formAdvisor.trim() || !formDate || !rescheduleTarget) return;
    setFormSubmitting(true);
    try {
      await academicApi.cancelAppointment(rescheduleTarget._id);
      await academicApi.bookAdvisor({ advisor_name: formAdvisor.trim(), date: formDate });
      showSuccess("Rescheduled with " + formAdvisor + " on " + fmtDate(formDate));
      closeModal(); await loadData();
    } catch (err) { setError(err?.message || "Failed to reschedule."); }
    finally { setFormSubmitting(false); }
  };

  const handleCancel = async (appt) => {
    if (!window.confirm("Cancel appointment with " + appt.advisor_name + "?\nThis cannot be undone.")) return;
    try {
      await academicApi.cancelAppointment(appt._id);
      showSuccess("Appointment with " + appt.advisor_name + " cancelled.");
      await loadData();
    } catch (err) { setError(err?.message || "Failed to cancel."); }
  };

  const openBook = () => { setFormAdvisor(""); setFormDate(""); setModal("book"); };
  const openReschedule = (appt) => { setRescheduleTarget(appt); setFormAdvisor(appt.advisor_name); setFormDate(""); setModal("reschedule"); };
  const closeModal = () => { setModal(null); setRescheduleTarget(null); setFormAdvisor(""); setFormDate(""); };
  const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { dateStyle: "medium" });
  const fmtLong = (d) => new Date(d).toLocaleDateString("en-US", { dateStyle: "long" });
  const today = new Date().toISOString().split("T")[0];

  if (loading) return (
    <div className="page-loading">
      <div className="loading-spinner" />
      <p>Verifying session...</p>
    </div>
  );

  if (!user) return (
    <div className="page-loading">
      <p>Not logged in. <a href="http://localhost:3000/login">Sign in</a></p>
    </div>
  );

  const handleRedirect = (targetUrl) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      window.location.href = `${targetUrl}?token=${token}`;
    } else {
      window.location.href = targetUrl;
    }
  };

  return (
    <div className="app">
      <header className="topnav">
        <div className="topnav-brand">
          <span className="brand-icon">&#127891;</span>
          <span>Smart Campus &middot; Academic Support</span>
        </div>
        <div className="topnav-right">
          <nav className="nav-links">
            <button
              onClick={() => handleRedirect("http://localhost:3000/dashboard")}
              className="btn-nav"
              title="Go to Identity Dashboard"
              style={{ cursor: "pointer" }}
            >
              <span className="nav-icon">&#127968;</span>
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => handleRedirect("http://localhost:3003")}
              className="btn-nav"
              title="Go to Notifications"
              style={{ cursor: "pointer" }}
            >
              <span className="nav-icon">&#128276;</span>
              <span>Notifications</span>
            </button>
          </nav>
          <span className="user-chip">
            <span className="user-avatar">{(user.name || "S")[0].toUpperCase()}</span>
            <span className="user-name">{user.name || user.email}</span>
          </span>
          <button className="btn-logout" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <main className="main">
        {successMsg && <div className="toast toast-success">{successMsg}</div>}
        {error && <div className="toast toast-error">{error} <button className="toast-close" onClick={() => setError("")}>x</button></div>}

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">My Academic Profile</h2>
            <button className="btn-secondary" onClick={loadData} disabled={loadingData}>{loadingData ? "Loading..." : "Refresh"}</button>
          </div>
          {loadingData ? (
            <div className="card skeleton-card">
              <div className="skeleton" style={{width:"60%",height:26,marginBottom:14}} />
              <div className="skeleton" style={{width:"40%",height:18}} />
            </div>
          ) : profile ? (
            <div className="profile-card">
              <div className="profile-grid">
                <div className="stat-box"><span className="stat-label">Student ID</span><span className="stat-value mono">{profile.student_id}</span></div>
                <div className="stat-box highlight-green"><span className="stat-label">Current GPA</span><span className="stat-value gpa">{Number(profile.gpa).toFixed(2)}</span></div>
                <div className="stat-box highlight-blue"><span className="stat-label">Cumulative GPA</span><span className="stat-value gpa">{Number(profile.cgpa).toFixed(2)}</span></div>
                <div className="stat-box"><span className="stat-label">Semester</span><span className="stat-value">Semester {profile.current_semester}</span></div>
              </div>
            </div>
          ) : (
            <div className="card empty-card">
              <span className="empty-icon">&#128237;</span>
              <p>No academic profile found for your student ID.</p>
              <small>Contact your academic office to register your profile.</small>
            </div>
          )}
        </section>

        <section className="section">
          <h2 className="section-title">My Class Schedule</h2>
          {loadingData ? (
            <div className="card skeleton-card"><div className="skeleton" style={{width:"70%",height:20,marginBottom:10}} /></div>
          ) : schedule.length === 0 ? (
            <div className="card empty-card"><span className="empty-icon">&#128197;</span><p>No class schedule found.</p></div>
          ) : (
            <div className="schedule-grid">
              {schedule.map((course, i) => (
                <div key={i} className="schedule-card">
                  <div className="course-code">{course.course_code}</div>
                  <div className="course-name">{course.course_name}</div>
                  <div className="course-meta">
                    <span className="meta-pill day">{course.day}</span>
                    <span className="meta-pill time">{course.time_slot}</span>
                    <span className="meta-pill room">{course.classroom}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Advisor Appointments</h2>
            <button className="btn-primary" onClick={openBook}>+ Book Appointment</button>
          </div>
          {loadingData ? (
            <div className="card skeleton-card"><div className="skeleton" style={{width:"70%",height:20}} /></div>
          ) : appointments.length === 0 ? (
            <div className="card empty-card">
              <span className="empty-icon">&#129309;</span>
              <p>No advisor appointments yet.</p>
              <button className="btn-primary" style={{marginTop:12}} onClick={openBook}>Book First Appointment</button>
            </div>
          ) : (
            <div className="appointments-list">
              {appointments.map((appt, i) => (
                <div key={i} className="appointment-card">
                  <div className="appt-info">
                    <div className="appt-advisor">
                      <span className="advisor-icon">&#128104;&#8205;&#127979;</span>
                      <span className="advisor-name">{appt.advisor_name}</span>
                    </div>
                    <div className="appt-date">{fmtLong(appt.appointment_date)}</div>
                    <span className={"status-badge status-" + (appt.status || "pending").toLowerCase()}>{appt.status || "Pending"}</span>
                  </div>
                  <div className="appt-actions">
                    <button className="btn-reschedule" onClick={() => openReschedule(appt)}>Reschedule</button>
                    <button className="btn-cancel-appt" onClick={() => handleCancel(appt)}>Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === "book" ? "Book Advisor Appointment" : "Reschedule Appointment"}</h3>
              <button className="modal-close" onClick={closeModal}>x</button>
            </div>
            {modal === "reschedule" && rescheduleTarget && (
              <div className="reschedule-info">
                <p>Current: <strong>{rescheduleTarget.advisor_name}</strong> on <strong>{fmtDate(rescheduleTarget.appointment_date)}</strong></p>
              </div>
            )}
            <form onSubmit={modal === "book" ? handleBook : handleReschedule} className="modal-form">
              <div className="form-group">
                <label>Advisor Name *</label>
                <input type="text" value={formAdvisor} onChange={(e) => setFormAdvisor(e.target.value)} placeholder="e.g. Dr. Ahmad Fakhruel" required autoFocus />
              </div>
              <div className="form-group">
                <label>{modal === "reschedule" ? "New Date *" : "Appointment Date *"}</label>
                <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} min={today} required />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={closeModal} disabled={formSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? "Submitting..." : modal === "book" ? "Confirm Booking" : "Confirm Reschedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
