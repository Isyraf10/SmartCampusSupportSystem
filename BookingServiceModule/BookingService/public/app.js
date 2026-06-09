const API_BASE        = 'http://localhost:5002/api/v1';
const IDENTITY_BASE   = 'http://localhost:5000/api/v1';

// ─────────────────────────────────────────────────────────────
// CENTRAL API CALL
// Reads the JWT token from localStorage and sends it as
// Authorization: Bearer <token> on every request.
// Controllers no longer trust X-User-Id / X-User-Role headers.
// ─────────────────────────────────────────────────────────────
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('accessToken') || '';

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            ...(options.headers || {})
        }
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return { ok: response.ok, status: response.status, data };
}

// ─────────────────────────────────────────────────────────────
// LOGIN — calls Identity Service directly
// POST http://localhost:5000/api/v1/auth/login
// ─────────────────────────────────────────────────────────────
async function login(email, password) {
    try {
        const response = await fetch(`${IDENTITY_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            return { ok: false, message: data.message || 'Login failed' };
        }

        // Identity Service returns: { data: { accessToken, refreshToken, user } }
        const { accessToken, refreshToken, user } = data.data;

        localStorage.setItem('accessToken',  accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId',       user.id);
        localStorage.setItem('userRole',     user.role);
        localStorage.setItem('userName',     user.name);

        return { ok: true, user };

    } catch (err) {
        return { ok: false, message: 'Cannot connect to Identity Service. Is it running on port 5000?' };
    }
}

// ─────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
}

// ─────────────────────────────────────────────────────────────
// LOAD FACILITIES (index.html)
// Admin  → sees Edit + Delete buttons
// Student → sees Book This Room button (opens date/time modal)
// ─────────────────────────────────────────────────────────────
async function loadFacilities() {
    const role      = localStorage.getItem('userRole');
    const { ok, data } = await apiCall('/facilities');
    const container = document.getElementById('facilitiesList');
    if (!container) return;

    if (ok && Array.isArray(data) && data.length > 0) {
        container.innerHTML = data.map(fac => `
            <div class="card" style="margin-bottom:15px;">
                <h3>${fac.name} (${fac.type})</h3>
                <p>📍 ${fac.location} &nbsp;|&nbsp; 👥 Capacity: ${fac.capacity}</p>
                <p>Status: <strong>${fac.active ? '✅ Active' : '❌ Inactive'}</strong></p>
                ${role === 'admin'
                    ? `<button onclick="openEditModal('${fac.id}','${fac.name}','${fac.type}','${fac.location}',${fac.capacity},${fac.active})"
                             style="background:#f39c12;">✏️ Edit</button>
                       <button onclick="deleteFacility('${fac.id}')"
                             style="background:#e74c3c;margin-left:8px;">🗑️ Delete</button>`
                    : (fac.active
                        ? `<button onclick="openBookingModal('${fac.id}','${fac.name}')">📅 Book This Room</button>`
                        : `<button disabled style="background:#aaa;cursor:not-allowed;">Not Available</button>`)
                }
            </div>
        `).join('');
    } else {
        container.innerHTML = '<p>No facilities available.</p>';
    }
}

// ─────────────────────────────────────────────────────────────
// BOOKING MODAL — student picks date & time
// ─────────────────────────────────────────────────────────────
function openBookingModal(facilityId, facilityName) {
    const old = document.getElementById('bookingModal');
    if (old) old.remove();

    const modal = document.createElement('div');
    modal.id = 'bookingModal';
    modal.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.5);display:flex;
        align-items:center;justify-content:center;z-index:9999;
    `;
    modal.innerHTML = `
        <div style="background:white;padding:30px;border-radius:10px;width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
            <h3 style="margin-bottom:16px;">📅 Book: ${facilityName}</h3>
            <label style="display:block;margin-bottom:6px;font-weight:600;">Date</label>
            <input type="date" id="modalDate" min="${new Date().toISOString().split('T')[0]}"
                   style="width:100%;padding:8px;margin-bottom:14px;border:1px solid #ddd;border-radius:4px;">
            <label style="display:block;margin-bottom:6px;font-weight:600;">Start Time</label>
            <input type="time" id="modalStart"
                   style="width:100%;padding:8px;margin-bottom:14px;border:1px solid #ddd;border-radius:4px;">
            <label style="display:block;margin-bottom:6px;font-weight:600;">End Time</label>
            <input type="time" id="modalEnd"
                   style="width:100%;padding:8px;margin-bottom:16px;border:1px solid #ddd;border-radius:4px;">
            <div id="modalMsg" style="margin-bottom:12px;display:none;padding:8px;border-radius:4px;"></div>
            <div style="display:flex;gap:10px;">
                <button onclick="submitBookingModal('${facilityId}')"
                        style="flex:1;background:#27ae60;color:white;padding:10px;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">
                    Confirm Booking
                </button>
                <button onclick="document.getElementById('bookingModal').remove()"
                        style="flex:1;background:#e74c3c;color:white;padding:10px;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">
                    Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function submitBookingModal(facilityId) {
    const date      = document.getElementById('modalDate').value;
    const startTime = document.getElementById('modalStart').value;
    const endTime   = document.getElementById('modalEnd').value;
    const msgDiv    = document.getElementById('modalMsg');

    if (!date || !startTime || !endTime) {
        msgDiv.textContent = '⚠️ Please fill in all fields.';
        msgDiv.style.cssText = 'display:block;background:#fff3cd;color:#856404;padding:8px;border-radius:4px;';
        return;
    }
    if (startTime >= endTime) {
        msgDiv.textContent = '⚠️ Start time must be before end time.';
        msgDiv.style.cssText = 'display:block;background:#fff3cd;color:#856404;padding:8px;border-radius:4px;';
        return;
    }

    msgDiv.textContent = 'Submitting...';
    msgDiv.style.cssText = 'display:block;background:#d1ecf1;color:#0c5460;padding:8px;border-radius:4px;';

    const { ok, data, status } = await apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify({ facilityId, date, startTime, endTime })
    });

    if (status === 401) {
        msgDiv.textContent = '❌ Session expired. Please log in again.';
        msgDiv.style.cssText = 'display:block;background:#f8d7da;color:#721c24;padding:8px;border-radius:4px;';
        setTimeout(() => { logout(); }, 1500);
        return;
    }

    if (ok) {
        msgDiv.textContent = '✅ Booking successful!';
        msgDiv.style.cssText = 'display:block;background:#d4edda;color:#155724;padding:8px;border-radius:4px;';
        setTimeout(() => {
            document.getElementById('bookingModal').remove();
            loadBookings();
        }, 1200);
    } else {
        msgDiv.textContent = '❌ ' + (data.message || 'Booking failed.');
        msgDiv.style.cssText = 'display:block;background:#f8d7da;color:#721c24;padding:8px;border-radius:4px;';
    }
}

// ─────────────────────────────────────────────────────────────
// CREATE FACILITY MODAL (admin)
// ─────────────────────────────────────────────────────────────
function openCreateFacilityModal() {
    const old = document.getElementById('facilityModal');
    if (old) old.remove();

    const modal = document.createElement('div');
    modal.id = 'facilityModal';
    modal.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.5);display:flex;
        align-items:center;justify-content:center;z-index:9999;
    `;
    modal.innerHTML = `
        <div style="background:white;padding:30px;border-radius:10px;width:380px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
            <h3 style="margin-bottom:16px;">🏢 Create New Facility</h3>
            <label style="display:block;margin-bottom:4px;font-weight:600;">Name</label>
            <input type="text" id="fName" placeholder="e.g. Dewan Al-Falah"
                   style="width:100%;padding:8px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;">
            <label style="display:block;margin-bottom:4px;font-weight:600;">Type</label>
            <input type="text" id="fType" placeholder="e.g. Hall, Lab, Room"
                   style="width:100%;padding:8px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;">
            <label style="display:block;margin-bottom:4px;font-weight:600;">Location</label>
            <input type="text" id="fLocation" placeholder="e.g. Block A, Level 2"
                   style="width:100%;padding:8px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;">
            <label style="display:block;margin-bottom:4px;font-weight:600;">Capacity</label>
            <input type="number" id="fCapacity" placeholder="e.g. 100" min="1"
                   style="width:100%;padding:8px;margin-bottom:16px;border:1px solid #ddd;border-radius:4px;">
            <div id="facilityModalMsg" style="margin-bottom:12px;display:none;padding:8px;border-radius:4px;"></div>
            <div style="display:flex;gap:10px;">
                <button onclick="submitCreateFacility()"
                        style="flex:1;background:#3498db;color:white;padding:10px;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">
                    Create
                </button>
                <button onclick="document.getElementById('facilityModal').remove()"
                        style="flex:1;background:#e74c3c;color:white;padding:10px;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">
                    Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function submitCreateFacility() {
    const name     = document.getElementById('fName').value.trim();
    const type     = document.getElementById('fType').value.trim();
    const location = document.getElementById('fLocation').value.trim();
    const capacity = parseInt(document.getElementById('fCapacity').value);
    const msgDiv   = document.getElementById('facilityModalMsg');

    if (!name || !type || !location || !capacity) {
        msgDiv.textContent = '⚠️ Please fill in all fields.';
        msgDiv.style.cssText = 'display:block;background:#fff3cd;color:#856404;padding:8px;border-radius:4px;';
        return;
    }

    const { ok, data } = await apiCall('/facilities', {
        method: 'POST',
        body: JSON.stringify({ name, type, location, capacity, active: true })
    });

    if (ok) {
        msgDiv.textContent = '✅ Facility created!';
        msgDiv.style.cssText = 'display:block;background:#d4edda;color:#155724;padding:8px;border-radius:4px;';
        setTimeout(() => {
            document.getElementById('facilityModal').remove();
            loadFacilities();
        }, 1000);
    } else {
        msgDiv.textContent = '❌ ' + (data.message || 'Failed to create facility.');
        msgDiv.style.cssText = 'display:block;background:#f8d7da;color:#721c24;padding:8px;border-radius:4px;';
    }
}

// ─────────────────────────────────────────────────────────────
// EDIT FACILITY MODAL (admin)
// ─────────────────────────────────────────────────────────────
function openEditModal(id, name, type, location, capacity, active) {
    const old = document.getElementById('editModal');
    if (old) old.remove();

    const modal = document.createElement('div');
    modal.id = 'editModal';
    modal.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.5);display:flex;
        align-items:center;justify-content:center;z-index:9999;
    `;
    modal.innerHTML = `
        <div style="background:white;padding:30px;border-radius:10px;width:380px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
            <h3 style="margin-bottom:16px;">✏️ Edit Facility</h3>
            <label style="display:block;margin-bottom:4px;font-weight:600;">Name</label>
            <input type="text" id="eName" value="${name}"
                   style="width:100%;padding:8px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;">
            <label style="display:block;margin-bottom:4px;font-weight:600;">Type</label>
            <input type="text" id="eType" value="${type}"
                   style="width:100%;padding:8px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;">
            <label style="display:block;margin-bottom:4px;font-weight:600;">Location</label>
            <input type="text" id="eLocation" value="${location}"
                   style="width:100%;padding:8px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;">
            <label style="display:block;margin-bottom:4px;font-weight:600;">Capacity</label>
            <input type="number" id="eCapacity" value="${capacity}" min="1"
                   style="width:100%;padding:8px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;">
            <label style="display:block;margin-bottom:8px;font-weight:600;">
                <input type="checkbox" id="eActive" ${active ? 'checked' : ''}> Active
            </label>
            <div id="editModalMsg" style="margin-bottom:12px;display:none;padding:8px;border-radius:4px;"></div>
            <div style="display:flex;gap:10px;">
                <button onclick="submitEditFacility('${id}')"
                        style="flex:1;background:#f39c12;color:white;padding:10px;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">
                    Save Changes
                </button>
                <button onclick="document.getElementById('editModal').remove()"
                        style="flex:1;background:#95a5a6;color:white;padding:10px;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">
                    Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function submitEditFacility(id) {
    const msgDiv = document.getElementById('editModalMsg');
    const { ok, data } = await apiCall(`/facilities/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            name:     document.getElementById('eName').value.trim(),
            type:     document.getElementById('eType').value.trim(),
            location: document.getElementById('eLocation').value.trim(),
            capacity: parseInt(document.getElementById('eCapacity').value),
            active:   document.getElementById('eActive').checked
        })
    });

    if (ok) {
        msgDiv.textContent = '✅ Facility updated!';
        msgDiv.style.cssText = 'display:block;background:#d4edda;color:#155724;padding:8px;border-radius:4px;';
        setTimeout(() => {
            document.getElementById('editModal').remove();
            loadFacilities();
        }, 1000);
    } else {
        msgDiv.textContent = '❌ ' + (data.message || 'Update failed.');
        msgDiv.style.cssText = 'display:block;background:#f8d7da;color:#721c24;padding:8px;border-radius:4px;';
    }
}

// ─────────────────────────────────────────────────────────────
// DELETE FACILITY (admin)
// ─────────────────────────────────────────────────────────────
async function deleteFacility(id) {
    if (!confirm('Are you sure you want to delete this facility?')) return;
    const { ok, data } = await apiCall(`/facilities/${id}`, { method: 'DELETE' });
    if (ok) {
        loadFacilities();
    } else {
        alert('❌ ' + (data.message || 'Delete failed.'));
    }
}

// ─────────────────────────────────────────────────────────────
// LOAD BOOKINGS (index.html)
// ─────────────────────────────────────────────────────────────
async function loadBookings() {
    const role     = localStorage.getItem('userRole');
    const endpoint = role === 'admin' ? '/bookings' : '/bookings/me';
    const { ok, data, status } = await apiCall(endpoint);
    const container = document.getElementById('bookingsList');
    const header    = document.getElementById('bookingsHeader');
    if (!container) return;

    if (status === 401) {
        container.innerHTML = '<p>Session expired. Please log in again.</p>';
        setTimeout(() => { logout(); }, 1500);
        return;
    }

    if (header) {
        header.innerText = role === 'admin'
            ? '📅 All System Bookings (Admin View)'
            : '📅 My Bookings';
    }

    if (ok && Array.isArray(data) && data.length > 0) {
        container.innerHTML = data.map(b => `
            <div class="card" style="margin-bottom:12px;border-left:4px solid ${b.status === 'CONFIRMED' ? '#27ae60' : '#e74c3c'};">
                <p><strong>Booking ID:</strong> ${b.id}</p>
                <p><strong>Facility:</strong> ${b.facilityId}</p>
                <p><strong>Booked By:</strong> ${b.userId}</p>
                <p><strong>Date:</strong> ${b.date} &nbsp;|&nbsp; <strong>Time:</strong> ${b.startTime} – ${b.endTime}</p>
                <p><strong>Status:</strong>
                    <span style="color:${b.status === 'CONFIRMED' ? '#27ae60' : '#e74c3c'};font-weight:bold;">
                        ${b.status}
                    </span>
                </p>
                ${b.status !== 'CANCELLED'
                    ? `<button onclick="cancelBooking('${b.id}')" style="background:#e74c3c;color:white;margin-top:8px;">Cancel Booking</button>`
                    : ''}
            </div>
        `).join('');
    } else {
        container.innerHTML = '<p>No bookings found.</p>';
    }
}

// ─────────────────────────────────────────────────────────────
// CANCEL BOOKING
// ─────────────────────────────────────────────────────────────
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    const { ok, data } = await apiCall(`/bookings/${bookingId}/cancel`, { method: 'PUT' });
    if (ok) {
        alert('Booking cancelled.');
        loadBookings();
    } else {
        alert('❌ ' + (data.message || 'Cancel failed.'));
    }
}

// ─────────────────────────────────────────────────────────────
// INITIALISE — runs when pages load
// ─────────────────────────────────────────────────────────────
window.onload = () => {
    // THE BULLETPROOF FIX: Check if the dashboard actually exists on the screen!
    // If 'facilitiesList' isn't on the page, we are on the login screen. STOP executing!
    if (!document.getElementById('facilitiesList')) {
        return; 
    }

    const token  = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const role   = localStorage.getItem('userRole');
    const name   = localStorage.getItem('userName');

    // If no token in localStorage, redirect to login
    if (!token || !userId) {
        window.location.href = 'login.html';
        return;
    }

    // Show user info in the page
    const displayEl = document.getElementById('userDisplay');
    if (displayEl) displayEl.innerText = (name || userId) + ' (' + role + ')';

    // Show admin bar if admin
    const adminBar = document.getElementById('adminBar');
    if (adminBar && role === 'admin') adminBar.style.display = 'flex';

    loadFacilities();
    loadBookings();
};