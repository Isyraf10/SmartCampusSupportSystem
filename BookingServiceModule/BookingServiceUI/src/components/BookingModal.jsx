export default function BookingModal({ facility, onClose, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      facilityId: facility.id,
      date: form.date.value,
      startTime: form.startTime.value,
      endTime: form.endTime.value,
    };
    
    if (data.startTime >= data.endTime) {
      // Better to use an on-screen error, but keeping alert for simplicity
      alert('Start time must be before end time.');
      return;
    }
    onSubmit(data);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Reserve {facility.name}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📅 Select Date</label>
            <input 
              type="date" name="date" required 
              min={new Date().toISOString().split('T')[0]} 
              className="modern-picker" 
            />
          </div>
          <div className="time-row-grid">
            <div className="form-group">
              <label>⏰ Start Time</label>
              <input type="time" name="startTime" required className="modern-picker" />
            </div>
            <div className="form-group">
              <label>🏁 End Time</label>
              <input type="time" name="endTime" required className="modern-picker" />
            </div>
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-book">Confirm Booking</button>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}