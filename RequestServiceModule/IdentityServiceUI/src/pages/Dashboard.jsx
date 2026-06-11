/**
 * Dashboard.jsx — requestService frontend
 * Central hub for Smart Campus SOA
 *
 * Token flow:
 *  - Token is stored in localStorage by AuthContext after login
 *  - goToService() appends ?token=<jwt> to the target service URL
 *  - The receiving service (bookingService etc.) reads it on mount,
 *    saves it to its own localStorage, then strips it from the URL
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

// ── Service URLs ─────────────────────────────────────────────────────────────
// Change these to real deployed URLs when you go to production.
const SERVICE_URLS = {
  booking:      import.meta.env.VITE_BOOKING_URL      || 'http://localhost:3002',
  itSupport:    import.meta.env.VITE_IT_SUPPORT_URL   || 'http://localhost:3001',
  notification: import.meta.env.VITE_NOTIFICATION_URL || 'http://localhost:3003',
};

export default function Dashboard() {
  const navigate    = useNavigate();
  const { user, logout } = useAuth();

  const token = localStorage.getItem('accessToken');

  const handleLogout = () => {
    logout();           // clears localStorage via AuthContext
    navigate('/login');
  };

  /**
   * Redirect to a service module with the JWT attached as a query param.
   * The receiving service reads ?token=, saves it to localStorage,
   * and strips it from the URL — so the user never sees a re-login page.
   */
  const goToService = (serviceUrl) => {
    if (!token) {
      alert('Sesi tamat. Sila login semula.');
      navigate('/login');
      return;
    }
    window.location.href = `${serviceUrl}?token=${token}`;
  };

  const navBtnStyle = {
    padding:         '10px 15px',
    backgroundColor: '#4c51bf',
    color:           'white',
    border:          'none',
    borderRadius:    '6px',
    cursor:          'pointer',
    fontSize:        '14px',
    fontWeight:      'bold',
    flex:            '1',
    margin:          '0 5px',
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>

        <div className="auth-header">
          <h1>Welcome to Smart Campus Support System</h1>
          <p>Central Dashboard</p>

          {/* ── Service navigation buttons ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button style={navBtnStyle} onClick={() => goToService(SERVICE_URLS.booking)}>
              Booking
            </button>
            <button style={navBtnStyle} onClick={() => goToService(SERVICE_URLS.itSupport)}>
              IT Support
            </button>
            <button style={navBtnStyle} onClick={() => goToService(SERVICE_URLS.notification)}>
              Notifications
            </button>
          </div>
        </div>

        <div style={{ padding: '20px', textAlign: 'center' }}>

          {/* ── User profile card ── */}
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
            User Profile
          </p>
          <div style={{
            backgroundColor: '#f5f5f5',
            padding:         '15px',
            borderRadius:    '8px',
            textAlign:       'left',
            marginBottom:    '20px',
          }}>
            <p style={{ margin: '8px 0' }}><strong>Name:</strong>  {user?.name         || 'N/A'}</p>
            <p style={{ margin: '8px 0' }}><strong>Email:</strong> {user?.email        || 'N/A'}</p>
            <p style={{ margin: '8px 0' }}><strong>Role:</strong>  {user?.role         || 'N/A'}</p>
            {user?.matricNumber && (
              <p style={{ margin: '8px 0' }}><strong>Matric Number:</strong> {user.matricNumber}</p>
            )}
          </div>

          {/* ── Logout button ── */}
          <button
            onClick={handleLogout}
            style={{
              width:           '100%',
              padding:         '12px',
              backgroundColor: '#e53e3e',
              color:           'white',
              border:          'none',
              borderRadius:    '8px',
              fontSize:        '16px',
              fontWeight:      '600',
              cursor:          'pointer',
            }}
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}
