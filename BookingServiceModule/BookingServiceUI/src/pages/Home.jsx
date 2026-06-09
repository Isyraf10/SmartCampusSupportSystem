import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { bookingApi } from '../services/bookingService';

export default function Home() {
  const { user, loading, logout, isAdmin } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings]     = useState([]);
  const [error, setError]           = useState('');

  const [bookingModal,  setBookingModal]  = useState(null);
  const [facilityModal, setFacilityModal] = useState(null);
  const [editModal,     setEditModal]     = useState(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [facData, bookData] = await Promise.all([
        bookingApi.getFacilities(),
        bookingApi.getBookings(isAdmin),
      ]);
      setFacilities(Array.isArray(facData)  ? facData  : []);
      setBookings(Array.isArray(bookData) ? bookData : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  // ── Booking handlers ───────────────────────────────────────────────────────

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      facilityId: bookingModal.id,
      date:       form.date.value,
      startTime:  form.startTime.value,
      endTime:    form.endTime.value,
    };

    if (data.startTime >= data.endTime) {
      alert('Start time must be before end time.');
      return;
    }

    try {
      await bookingApi.createBooking(data);
      setBookingModal(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingApi.cancelBooking(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed');
    }
  };

  // ── Facility handlers (admin only) ─────────────────────────────────────────

  const handleCreateFacility = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      await bookingApi.createFacility({
        name:     form.name.value.trim(),
        type:     form.type.value.trim(),
        location: form.location.value.trim(),
        capacity: parseInt(form.capacity.value, 10),
        active:   true,
      });
      setFacilityModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create facility');
    }
  };

  const handleEditFacility = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      await bookingApi.updateFacility(editModal.id, {
        name:     form.name.value.trim(),
        type:     form.type.value.trim(),
        location: form.location.value.trim(),
        capacity: parseInt(form.capacity.value, 10),
        active:   form.active.checked,
      });
      setEditModal(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteFacility = async (id) => {
    if (!confirm('Are you sure you want to delete this facility?')) return;
    try {
      await bookingApi.deleteFacility(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="container">
      <h1>Smart Campus Facility Booking</h1>

      <div className="topbar">
        <p className="user-info">
          Logged in as: <strong>{user?.name || user?.id} ({user?.role})</strong>
        </p>
        <button className="btn-logout" onClick={logout}>Logout</button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {isAdmin && (
        <div className="admin-bar">
          <span>Admin Mode — You can manage facilities below</span>
          <button className="btn-create" onClick={() => setFacilityModal(true)}>
            + Create New Facility
          </button>
        </div>
      )}

      {/* ── Facilities list ── */}
      <h2>Available Facilities</h2>
      {facilities.length === 0 ? (
        <p>No facilities available.</p>
      ) : (
        facilities.map((fac) => (
          <div key={fac.id} className="card">
            <h3>{fac.name} ({fac.type})</h3>
            <p>Location: {fac.location} | Capacity: {fac.capacity}</p>
            <p>Status: <strong>{fac.active ? 'Active' : 'Inactive'}</strong></p>
            {isAdmin ? (
              <>
                <button className="btn-edit"   onClick={() => setEditModal(fac)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDeleteFacility(fac.id)}>Delete</button>
              </>
            ) : fac.active ? (
              <button onClick={() => setBookingModal({ id: fac.id, name: fac.name })}>
                Book This Room
              </button>
            ) : (
              <button disabled className="btn-disabled">Not Available</button>
            )}
          </div>
        ))
      )}

      {/* ── Bookings list ── */}
      <h2>{isAdmin ? 'All System Bookings (Admin View)' : 'My Bookings'}</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map((b) => (
          <div
            key={b.id}
            className="card booking-card"
            style={{ borderLeftColor: b.status === 'CONFIRMED' ? '#27ae60' : '#e74c3c' }}
          >
            <p><strong>Booking ID:</strong> {b.id}</p>
            <p><strong>Facility:</strong> {b.facilityId}</p>
            {isAdmin && <p><strong>Booked By:</strong> {b.userId}</p>}
            <p><strong>Date:</strong> {b.date} | <strong>Time:</strong> {b.startTime} – {b.endTime}</p>
            <p><strong>Status:</strong> {b.status}</p>
            {b.status !== 'CANCELLED' && (
              <button className="btn-delete" onClick={() => handleCancelBooking(b.id)}>
                Cancel Booking
              </button>
            )}
          </div>
        ))
      )}

      {/* ── Book room modal ── */}
      {bookingModal && (
        <div className="modal-overlay" onClick={() => setBookingModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Book: {bookingModal.name}</h3>
            <form onSubmit={handleCreateBooking}>
              <label>Date</label>
              <input type="date" name="date" required min={new Date().toISOString().split('T')[0]} />
              <label>Start Time</label>
              <input type="time" name="startTime" required />
              <label>End Time</label>
              <input type="time" name="endTime" required />
              <div className="modal-actions">
                <button type="submit" className="btn-create">Confirm Booking</button>
                <button type="button" className="btn-delete" onClick={() => setBookingModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Create facility modal (admin) ── */}
      {facilityModal && (
        <div className="modal-overlay" onClick={() => setFacilityModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Facility</h3>
            <form onSubmit={handleCreateFacility}>
              <label>Name</label>
              <input type="text" name="name" required placeholder="e.g. Dewan Al-Falah" />
              <label>Type</label>
              <input type="text" name="type" required placeholder="e.g. Hall, Lab, Room" />
              <label>Location</label>
              <input type="text" name="location" required placeholder="e.g. Block A, Level 2" />
              <label>Capacity</label>
              <input type="number" name="capacity" required min="1" placeholder="e.g. 100" />
              <div className="modal-actions">
                <button type="submit">Create</button>
                <button type="button" className="btn-delete" onClick={() => setFacilityModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit facility modal (admin) ── */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Facility</h3>
            <form onSubmit={handleEditFacility}>
              <label>Name</label>
              <input type="text" name="name" defaultValue={editModal.name} required />
              <label>Type</label>
              <input type="text" name="type" defaultValue={editModal.type} required />
              <label>Location</label>
              <input type="text" name="location" defaultValue={editModal.location} required />
              <label>Capacity</label>
              <input type="number" name="capacity" defaultValue={editModal.capacity} required min="1" />
              <label className="checkbox-label">
                <input type="checkbox" name="active" defaultChecked={editModal.active} /> Active
              </label>
              <div className="modal-actions">
                <button type="submit" className="btn-edit">Save Changes</button>
                <button type="button" onClick={() => setEditModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
