import React, { useState } from 'react';

export default function App() {
  
  const [profile, setProfile] = useState({ student_id: 'UMT-2026', cgpa: '3.85' });
  const [schedule, setSchedule] = useState([
    { course_name: 'Data Structures & Algorithms', time_slot: '08:00 AM - 10:00 AM', classroom: 'BK 1, UMT' },
    { course_name: 'System Analysis and Design', time_slot: '11:00 AM - 01:00 PM', classroom: 'Makmal Komputer 3' },
    { course_name: 'Database SQL Architecture', time_slot: '02:30 PM - 04:30 PM', classroom: 'Dewan Kuliah Pusat' }
  ]);
  const [bookingModal, setBookingModal] = useState(false);

  const handleBookAdvisor = (e) => {
    e.preventDefault();
    alert('✓ Advisor appointment booked successfully!');
    setBookingModal(false);
  };

  return (
    <div className="container" style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '42px', color: '#100609' }}>Smart Campus Academic Support Dashboard</h1>

      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px dashed #f7e4eb' }}>
        <p className="user-info" style={{ margin: 0, color: '#75636b' }}>
          Welcome back, <strong style={{ color: '#100609' }}>Jenny Rechel</strong>! 🌟
        </p>
        <button className="btn-logout" style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }} onClick={() => alert('Successfully logged out from Smart Campus System.')}>Logout</button>
      </div>

      <h2 style={{ fontSize: '24px', color: '#100609', borderBottom: '2px solid #f7e4eb', paddingBottom: '8px', margin: '32px 0 16px' }}>My Academic Profile</h2>
      <div className="card" style={{ border: '1px solid #f7e4eb', padding: '20px', marginBottom: '16px', borderRadius: '8px', background: 'rgba(252, 243, 245, 0.6)', boxShadow: 'rgba(223, 180, 187, 0.2) 0 10px 15px -3px', borderLeft: '4px solid #3498db', transition: 'transform 0.2s' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#100609' }}>Student ID: {profile.student_id}</h3>
        <p style={{ fontSize: '1.2rem', margin: '0 0 15px 0' }}>
          Current CGPA: <strong style={{ color: '#27ae60' }}>{profile.cgpa}</strong> 🌟
        </p>
        <button className="btn-create" style={{ backgroundColor: '#ff8da1', color: '#fff', border: '1px solid rgba(255, 141, 161, 0.5)', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }} onClick={() => setBookingModal(true)}>
          📅 Book Academic Advisor
        </button>
      </div>

      <h2>My Class Schedule</h2>
      {schedule.map((course, idx) => (
        <div key={idx} className="card booking-card" style={{ border: '1px solid #f7e4eb', padding: '20px', marginBottom: '16px', borderRadius: '8px', background: 'rgba(252, 243, 245, 0.6)', boxShadow: 'rgba(223, 180, 187, 0.2) 0 10px 15px -3px', borderLeft: '4px solid #ff8da1' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#100609' }}>{course.course_name}</h3>
          <p style={{ margin: 0, color: '#75636b' }}>Time: {course.time_slot} | Room: {course.classroom}</p>
        </div>
      ))}

      {bookingModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justify: 'center', zIndex: 9999 }} onClick={() => setBookingModal(false)}>
          <div className="modal" style={{ background: '#fff', border: '1px solid #f7e4eb', padding: '30px', borderRadius: '12px', width: '400px', maxWidth: '90vw', boxShadow: 'rgba(223, 180, 187, 0.2) 0 10px 15px -3px' }} onClick={(e) => e.stopPropagation()}>
            <h3>Book Advisor Appointment</h3>
            <form onSubmit={handleBookAdvisor}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#100609' }}>Advisor Name</label>
              <input type="text" name="advisorName" required defaultValue="Dr. Isyraf" style={{ width: '100%', padding: '10px', marginBottom: '18px', border: '1px solid #f7e4eb', borderRadius: '6px', background: '#fcf8fa', boxSizing: 'border-box' }} />
              
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#100609' }}>Appointment Date</label>
              <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '10px', marginBottom: '18px', border: '1px solid #f7e4eb', borderRadius: '6px', background: '#fcf8fa', boxSizing: 'border-box' }} />
              
              <div className="modal-actions" style={{ display: 'flex', gap: 12, marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#ff8da1', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Submit Request</button>
                {/* LINE 54 DI SINI BAA CHOKK! SUDAH SIAP MASUK ALERT CANCEL FORMAL! 🚀 */}
                <button type="button" style={{ flex: 1, backgroundColor: '#7f8c8d', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }} onClick={() => { alert('✕ Advisor appointment request cancelled successfully.'); setBookingModal(false); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}