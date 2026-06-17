import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { bookingApi } from '../services/bookingService';
import BookingModal from '../components/BookingModal';
import FacilityModal from '../components/FacilityModal';

export default function Home() {
  const { user, loading, logout, isAdmin } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings]     = useState([]);
  const [error, setError]           = useState('');
  
  // Clean Modal States
  const [bookingModalFac, setBookingModalFac] = useState(null);
  const [showCreateFac, setShowCreateFac]     = useState(false);
  const [editFacData, setEditFacData]         = useState(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [facData, bookData] = await Promise.all([
        bookingApi.getFacilities(),
        bookingApi.getBookings(isAdmin),
      ]);
      setFacilities(Array.isArray(facData) ? facData : []);
      setBookings(Array.isArray(bookData) ? bookData : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // Temporary error display helper (better UX than window.alert)
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 5000); // clear after 5 seconds
  };

  if (loading) {
    return <div className="app-container"><p className="loading-text">Loading Dashboard...</p></div>;
  }

  /* ─── Handlers ────────────────────────────────────────── */
  const handleBookingSubmit = async (data) => {
    try {
      await bookingApi.createBooking(data);
      setBookingModalFac(null);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Booking failed');
    }
  };

  const handleFacilitySubmit = async (data) => {
    try {
      if (editFacData) {
        await bookingApi.updateFacility(editFacData.id, data);
      } else {
        await bookingApi.createFacility(data);
      }
      setShowCreateFac(false);
      setEditFacData(null);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Facility save failed');
    }
  };

  const handleAction = async (actionFn, confirmMsg) => {
    if (window.confirm(confirmMsg)) {
      try {
        await actionFn();
        loadData();
      } catch (err) {
        showError(err.response?.data?.message || 'Action failed');
      }
    }
  };

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div className="app-container">
      <header className="dashboard-header">
        <div className="title-highlight-wrapper">
          <h1 className="page-title">Smart Campus Facility Booking</h1>
          <p className="title-subtitle">Make booking easy and efficient</p>
        </div>
        
        <div className="user-profile-widget">
          <div className="greeting-wrapper">
            <span className="hi-text">Hi, {user?.name || user?.id?.split('@')[0]}</span>
            <span className="role-badge">{user?.role || 'student'}</span>
          </div>
          <div className="header-actions">
            <button className="btn-home" onClick={() => window.location.href = 'http://localhost:3000/dashboard'}>
              Dashboard
            </button>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      {error && <div className="error-msg" style={{padding: '1rem', background: '#ffebee', color: '#c62828', textAlign: 'center', marginBottom: '1rem', borderRadius: '8px'}}>{error}</div>}

      {isAdmin && (
        <div className="admin-bar">
          <span> Admin Mode — Facility Management</span>
          <button className="btn-create" onClick={() => setShowCreateFac(true)}>+ Create New Facility</button>
        </div>
      )}

      <main className="dashboard-grid">
        {/* Left Column: Facilities */}
        <section className="dashboard-column facilities-column">
          <h2 className="section-title">Available Facilities</h2>
          <div className="scroll-area">
            {facilities.length === 0 ? <p className="empty-state">No facilities available.</p> : (
              facilities.map((fac) => (
                <div key={fac.id} className="card facility-card">
                  <div className="card-header">
                    <h3>{fac.name}</h3>
                    <span className={`status-badge ${fac.active ? 'active' : 'inactive'}`}>
                      {fac.active ? 'Available' : 'Maintenance'}
                    </span>
                  </div>
                  <p className="card-detail"><strong>Type:</strong> {fac.type}</p>
                  <p className="card-detail"><strong>Location:</strong> {fac.location}</p>
                  <p className="card-detail"><strong>Capacity:</strong> {fac.capacity} pax</p>
                  
                  <div className="card-actions">
                    {isAdmin ? (
                      <>
                        <button className="btn-edit" onClick={() => setEditFacData(fac)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleAction(() => bookingApi.deleteFacility(fac.id), 'Delete this facility?')}>Delete</button>
                      </>
                    ) : fac.active ? (
                      <button className="btn-book" onClick={() => setBookingModalFac(fac)}>Book This Room</button>
                    ) : (
                      <button disabled className="btn-disabled">Unavailable</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Column: Bookings */}
        <section className="dashboard-column bookings-column">
          <h2 className="section-title">{isAdmin ? 'All System Bookings' : 'My Bookings'}</h2>
          <div className="scroll-area">
            {bookings.length === 0 ? <p className="empty-state">No bookings found.</p> : (
              bookings.map((b) => (
                <div key={b.id} className={`card booking-card ${b.status === 'CONFIRMED' ? 'confirmed' : 'cancelled'}`}>
                  <div className="booking-header">
                    <span className="booking-ref">#{b.id.slice(-5).toUpperCase()}</span>
                    <span className={`status-text ${b.status.toLowerCase()}`}>{b.status}</span>
                  </div>
                  <h4 className="booking-facility">
                    {facilities.find(f => f.id === b.facilityId)?.name || 'Unknown Facility'}
                  </h4>
                  {isAdmin && <p className="card-detail"><strong>Booked By:</strong> User-{b.userId.slice(-5).toUpperCase()}</p>}
                  <div className="booking-datetime">
                    <span className="date-box">📅 {b.date}</span>
                    <span className="time-box">⏳ {b.startTime} – {b.endTime}</span>
                  </div>

                  {(b.status !== 'CANCELLED' || isAdmin) && (
                    <div className="card-actions end">
                      {b.status !== 'CANCELLED' && (
                        <button className="btn-cancel" onClick={() => handleAction(() => bookingApi.cancelBooking(b.id), 'Cancel this booking?')}>Cancel</button>
                      )}
                      {isAdmin && (
                        <button className="btn-delete" onClick={() => handleAction(() => bookingApi.deleteBooking(b.id), 'Permanently delete record?')}>Delete</button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Render Modals dynamically */}
      {bookingModalFac && <BookingModal facility={bookingModalFac} onClose={() => setBookingModalFac(null)} onSubmit={handleBookingSubmit} />}
      {(showCreateFac || editFacData) && <FacilityModal editData={editFacData} onClose={() => { setShowCreateFac(false); setEditFacData(null); }} onSubmit={handleFacilitySubmit} />}
    </div>
  );
}