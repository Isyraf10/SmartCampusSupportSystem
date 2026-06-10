import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { academicApi } from '../services/academicService';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState('');
  const [bookingModal, setBookingModal] = useState(false);

  const loadAcademicData = useCallback(async () => {
    try {
      const [profData, schedData] = await Promise.all([
        academicApi.getProfile(),
        academicApi.getSchedule(),
      ]);
      setProfile(profData);
      setSchedule(Array.isArray(schedData) ? schedData : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load academic data');
    }
  }, []);

  useEffect(() => {
    loadAcademicData();
  }, [loadAcademicData]);

  const handleBookAdvisor = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      advisor_name: form.advisorName.value.trim(),
      date: form.date.value,
    };

    try {
      await academicApi.bookAdvisor(data);
      alert('✓ Advisor appointment booked successfully!');
      setBookingModal(false);
      loadAcademicData();
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) {
    return <div className="container"><p>Loading system configurations...</p></div>;
  }

  return (
    <div className="container">
      <h1>Smart Campus Academic Support Dashboard</h1>

      <div className="topbar">
        <p className="user-info">
          Welcome back, <strong>{user?.name || 'Student'}</strong>!
        </p>
        <button className="btn-logout" onClick={logout}>Logout</button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <h2>My Academic Profile</h2>
      <div className="card" style={{ borderLeft: '4px solid #3498db' }}>
        <h3>Student ID: {profile?.student_id || 'Fetching...'}</h3>
        <p style={{ fontSize: '1.2rem' }}>
          Current CGPA: <strong style={{ color: '#27ae60' }}>{profile?.cgpa || '3.50'}</strong> 🌟
        </p>
        <button className="btn-create" onClick={() => setBookingModal(true)}>
          📅 Book Academic Advisor
        </button>
      </div>

      <h2>My Class Schedule</h2>
      {schedule.length === 0 ? (
        <p>No classes scheduled for today.</p>
      ) : (
        schedule.map((course, idx) => (
          <div key={idx} className="card booking-card">
            <h3>{course.course_name || 'Subject'}</h3>
            <p>Time: {course.time_slot || 'N/A'} | Room: {course.classroom || 'N/A'}</p>
          </div>
        ))
      )}

      {bookingModal && (
        <div className="modal-overlay" onClick={() => setBookingModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Book Advisor Appointment</h3>
            <form onSubmit={handleBookAdvisor}>
              <label>Advisor Name</label>
              <input type="text" name="advisorName" required placeholder="e.g. Dr. Isyraf" />
              
              <label>Appointment Date</label>
              <input type="date" name="date" required min={new Date().toISOString().split('T')[0]} />
              
              <div className="modal-actions">
                <button type="submit" className="btn-create">Submit Request</button>
                <button type="button" className="btn-delete" onClick={() => setBookingModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}