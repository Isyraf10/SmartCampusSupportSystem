import React, { useState, useEffect } from 'react';

function App() {
  const [profile, setProfile] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [advisorName, setAdvisorName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('Bearer DUMMY_TOKEN_UNTUK_TESTING');

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/v1/academic/profile', {
        headers: { 'Authorization': token }
      });
      const data = await res.json();
      if (res.ok) setProfile(data);
    } catch (err) {
      console.error("Gagal ambil profil:", err);
    }
  };

  const fetchSchedule = async () => {
    try {
      const res = await fetch('/api/v1/academic/schedule', {
        headers: { 'Authorization': token }
      });
      const data = await res.json();
      if (res.ok) setSchedule(data);
    } catch (err) {
      console.error("Gagal ambil jadual:", err);
    }
  };

  const handleBookAdvisor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/academic/book-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ advisor_name: advisorName, date: appointmentDate })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setAdvisorName('');
        setAppointmentDate('');
      } else {
        setMessage(data.message || "Gagal membuat tempahan.");
      }
    } catch (err) {
      setMessage("Ralat: Pastikan Backend di port 5002 sudah dibuka!");
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSchedule();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#faf7f2', minHeight: '100vh', color: '#4a3e3d' }}>
      <header style={{ borderBottom: '2px solid #e6dfd5', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1 style={{ color: '#d4a373', margin: 0 }}>🍂 Academic Support Dashboard</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#a3937b' }}>Universiti Malaysia Terengganu Smart Campus System</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <section style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#c97a7e', marginTop: 0 }}>👤 Academic Profile</h2>
          {profile ? (
            <div>
              <p><strong>Student ID:</strong> {profile.student_id}</p>
              <p><strong>CGPA:</strong> 🌟 {profile.cgpa || '3.50'}</p>
            </div>
          ) : (
            <p style={{ color: '#b5a897', fontStyle: 'italic' }}>Menunggu sambungan API / Sila masukkan real token...</p>
          )}
        </section>

        <section style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#7b9e89', marginTop: 0 }}>📅 Class Schedule</h2>
          {schedule.length > 0 ? (
            <ul style={{ paddingLeft: '20px' }}>
              {schedule.map((item, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>
                  <strong>{item.course_code}:</strong> {item.course_name} ({item.day} - {item.time})
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#b5a897' }}>Tiada jadual kelas ditemui untuk modul ini.</p>
          )}
        </section>

        <section style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', gridColumn: 'span 2' }}>
          <h2 style={{ color: '#d4a373', marginTop: 0 }}>🤝 Book Advisor Appointment</h2>
          <form onSubmit={handleBookAdvisor} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Nama Penasihat:</label>
              <input type="text" value={advisorName} onChange={(e) => setAdvisorName(e.target.value)} placeholder="Contoh: Dr. Azmi" required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d3c7b5', width: '200px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Tarikh Janji Temu:</label>
              <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d3c7b5' }} />
            </div>
            <button type="submit" style={{ backgroundColor: '#d4a373', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '22px', fontWeight: 'bold' }}>Submit Booking</button>
          </form>
          {message && <p style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0eae1', borderRadius: '6px', color: '#8a6d4b', fontWeight: 'bold' }}>🔔 Status: {message}</p>}
        </section>
      </div>
    </div>
  );
}

export default App;