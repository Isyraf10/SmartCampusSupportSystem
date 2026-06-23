/**
 * Dashboard.jsx — requestService frontend
 * Central hub for Smart Campus SOA
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

// ── Service URLs ─────────────────────────────────────────────────────────────
const SERVICE_URLS = {
  booking:      import.meta.env.VITE_BOOKING_URL      || 'http://localhost:3001',
  itSupport:    import.meta.env.VITE_IT_SUPPORT_URL   || 'http://localhost:3002',
  notification: import.meta.env.VITE_NOTIFICATION_URL || 'http://localhost:3003',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const token = localStorage.getItem('accessToken');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToService = (serviceUrl) => {
    if (!token) {
      alert('Sesi tamat. Sila login semula.');
      navigate('/login');
      return;
    }
    window.location.href = `${serviceUrl}?token=${token}`;
  };

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="dashboard-layout">
      {/* ── Navbar ── */}
      <nav className="dashboard-navbar">
        <div className="navbar-brand">Smart Campus System</div>
        <div className="navbar-actions">
          <button className="btn-nav-action" onClick={() => goToService(SERVICE_URLS.notification)}>
            {/* Clean SVG Bell Icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Notifications
          </button>
          <div className="user-avatar-badge">
            <div className="avatar-circle">{getInitials(user?.name)}</div>
            <span>{user?.name || 'User'}</span>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="dashboard-content">
        
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <p>Welcome Dashboard</p>
          <h2>Welcome, {user?.name || 'User'}!</h2>
        </div>

        {/* User Account Identity Card */}
        <div className="identity-section">
          <div className="section-label">User Account Identity</div>
          
          <div className="identity-header">
            <div className="avatar-circle-lg">{getInitials(user?.name)}</div>
            <div>
              <h3>{user?.name || 'User'}</h3>
              <span className="role-badge">{user?.role || 'student'}</span>
            </div>
          </div>

          <div className="identity-details">
            <div className="detail-field">
              <div className="detail-field-label">Email Address</div>
              <div className="detail-field-value">{user?.email || 'N/A'}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Matric Number</div>
              <div className="detail-field-value">{user?.matricNumber || 'N/A'}</div>
            </div>
          </div>

          <button className="btn-logout-flat" onClick={handleLogout}>
            Logout Account
          </button>
        </div>

        {/* Services Navigation Grid */}
        <div className="services-grid">
          
          {/* Card 1: Facility Booking */}
          <div className="service-card booking-card-accent" onClick={() => goToService(SERVICE_URLS.booking)}>
            <div className="service-card-icon">
              {/* Clean SVG Building Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
              </svg>
            </div>
            <h3>Facility Booking</h3>
            <p>Manage campus facility and resource slots reservations</p>
          </div>

          {/* Card 2: Academic Support */}
          <div className="service-card support-card-accent" onClick={() => goToService(SERVICE_URLS.itSupport)}>
            <div className="service-card-icon">
              {/* Clean SVG Graduation Cap Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
              </svg>
            </div>
            <h3>Academic Support</h3>
            <p>Access academic advisor schedules and consultation modules</p>
          </div>

        </div>

      </div>
    </div>
  );
}
