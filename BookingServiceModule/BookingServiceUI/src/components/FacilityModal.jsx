import { useState } from 'react';

export default function FacilityModal({ editData, onClose, onSubmit }) {
  const isEdit = !!editData;
  const [isActive, setIsActive] = useState(isEdit ? editData.active : true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    onSubmit({
      name: form.name.value.trim(),
      type: form.type.value.trim(),
      location: form.location.value.trim(),
      capacity: parseInt(form.capacity.value, 10),
      active: isActive,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{isEdit ? 'Edit Facility' : 'Create New Facility'}</h3>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input type="text" name="name" defaultValue={editData?.name} required placeholder="e.g. Dewan Al-Falah" />
          
          <label>Type</label>
          <input type="text" name="type" defaultValue={editData?.type} required placeholder="e.g. Hall, Lab" />
          
          <label>Location</label>
          <input type="text" name="location" defaultValue={editData?.location} required placeholder="e.g. Block A" />
          
          <label>Capacity</label>
          <input type="number" name="capacity" defaultValue={editData?.capacity} required min="1" />
          
          {isEdit && (
            <>
              <label>Facility Status</label>
              <div className="status-toggle-group">
                <button type="button" className={`toggle-btn ${isActive ? 'active-select' : ''}`} onClick={() => setIsActive(true)}>
                  🟢 Active
                </button>
                <button type="button" className={`toggle-btn ${!isActive ? 'maintenance-select' : ''}`} onClick={() => setIsActive(false)}>
                  🛑 Maintenance
                </button>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="submit" className={isEdit ? "btn-edit" : "btn-create"}>
              {isEdit ? 'Save Changes' : 'Create Facility'}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}