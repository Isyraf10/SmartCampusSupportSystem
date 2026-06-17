import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth'; // Membawa fungsi token auth Isyraf
import { academicApi } from './services/academicService'; // Panggil fungsi API sedia ada
import axiosClient from './API/axiosClient'; // Kunci Utama: Import client axios tulen port 5001/3001 chokk!

export default function App() {
  const { user, loading, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState('');
  const [bookingModal, setBookingModal] = useState(false);

  // --- STATE UNTUK BORANG INPUT DATABASE USER ---
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [classDay, setClassDay] = useState('Monday');
  const [timeSlot, setTimeSlot] = useState('');
  const [classroom, setClassroom] = useState('');

  // --- 1. FUNGSI MENYEDUT DATA REAL DARI MONGODB ---
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
      // Jika database kosong bersih (404), kita set array kosong [] tanpa crash!
      if (err === "Class schedule not found." || err?.response?.status === 404) {
        setSchedule([]);
      } else {
        setError(err.message || 'Failed to fetch database content');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadAcademicData();
    }
  }, [user, loadAcademicData]);

// --- 2. FUNGSI USER INPUT: TAMBAH SUBJEK BARU MASUK MONGODB (POST) ---
  const handleInsertDatabase = async (e) => {
    e.preventDefault();
    if (!courseCode || !courseName || !timeSlot || !classroom) {
      return alert('Please fill in all the required database input fields before submitting.');
    }

    const payload = {
      course_code: courseCode,
      course_name: courseName,
      day: classDay,
      time_slot: timeSlot,
      classroom: classroom
    };

    try {
      // Tembak masuk database backend real!
      await axiosClient.post('/academic/schedule', payload); 
      alert('✓ Data successfully inserted into MongoDB database!');
      
      // Reset input form semula
      setCourseCode('');
      setCourseName('');
      setTimeSlot('');
      setClassroom('');
      
      // Refresh balik data skrin biar subjek baru auto-keluar dinamik!
      loadAcademicData(); 
    } catch (err) {
      alert(err || 'Failed to insert into MongoDB');
    }
  };

  // --- 3. FUNGSI BOOK ADVISOR APPOINTMENT ---
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
      alert(err || 'Booking failed');
    }
  };

  if (loading) {
    return <div className="container"><p>Loading system configuration & verification token...</p></div>;
  }

  return (
    <div className="container">
      <h1>Smart Campus Academic Support Dashboard</h1>

      <div className="topbar">
        <p className="user-info">
          Welcome back, <strong>{user?.name || 'Student'}</strong>! 🌟
        </p>
        <button className="btn-logout" onClick={logout}>Logout</button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {/* ================= SECTION A: PROFILE ================= */}
      <h2>My Academic Profile</h2>
      <div className="card" style={{ borderLeft: '4px solid #3498db' }}>
        <h3>Student ID: {profile?.student_id || 'No profile record in DB'}</h3>
        <p style={{ fontSize: '1.2rem' }}>
          Current CGPA: <strong style={{ color: '#27ae60' }}>{profile?.cgpa || 'N/A'}</strong>
        </p>
        <button className="btn-create" onClick={() => setBookingModal(true)} style={{ marginTop: '10px' }}>
          📅 Book Academic Advisor
        </button>
      </div>

      {/* ================= SECTION B: CLASS SCHEDULE ================= */}
      <h2>My Class Schedule (Depends on Database)</h2>
      {schedule.length === 0 ? (
        <div className="card" style={{ background: '#fcf8fa', textAlign: 'center', padding: '30px', border: '1px dashed var(--border)' }}>
          <p style={{ color: '#75636b', fontWeight: '500' }}>🗄️ Database is completely empty! Waiting for user input...</p>
        </div>
      ) : (
        schedule.map((course, idx) => (
          <div key={idx} className="card booking-card">
            <h3>[{course.course_code}] {course.course_name}</h3>
            <p>Day: {course.day} | Time: {course.time_slot} | Room: {course.classroom}</p>
          </div>
        ))
      )}

      {/* ================= SECTION C: BORANG INPUT DATABASE USER ================= */}
      <h2 style={{ marginTop: '40px', color: '#ff6f91' }}>🛠️ User Database Controller Form</h2>
      <div className="card" style={{ background: 'rgba(252, 243, 245, 0.8)', border: '1px solid var(--accent-border)' }}>
        {/* TUKAR DI SINI PIGI ENGLISH PROFESSIONAL: */}
        <p style={{ marginBottom: '15px', fontSize: '14px', color: '#75636b' }}>
          Input new course data below to persist records directly into the MongoDB database via the backend API endpoints.
        </p>
        <form onSubmit={handleInsertDatabase} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Course Code (e.g., CSF3104)" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
          <input type="text" placeholder="Course Name (e.g., Data Structures)" value={courseName} onChange={(e) => setCourseName(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
          <select value={classDay} onChange={(e) => setClassDay(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'white' }}>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
          </select>
          <input type="text" placeholder="Time Slot (e.g., 08:00 AM - 10:00 AM)" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
          <input type="text" placeholder="Classroom Location (e.g., BK 1, UMT)" value={classroom} onChange={(e) => setClassroom(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
          <button type="submit" className="btn-create" style={{ width: '100%', marginTop: '5px' }}>
            🚀 Insert Data Into Native MongoDB
          </button>
        </form>
      </div>

      {/* ================= APPOINTMENT MODAL ================= */}
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