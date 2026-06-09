import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import './Pages.css';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sendForm, setSendForm] = useState({ userId: '', type: 'REMINDER', message: '' });
  const [activeTab, setActiveTab] = useState('my');

  const TYPES = ['REMINDER', 'BOOKING_CONFIRMATION', 'EVENT_REGISTRATION', 'EVENT_CANCELLATION', 'ANNOUNCEMENT'];
  const TYPE_ICONS = { EVENT_REGISTRATION: '🎟️', EVENT_CANCELLATION: '❌', REMINDER: '⏰', BOOKING_CONFIRMATION: '✅', ANNOUNCEMENT: '📢' };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'all' ? notificationService.getAllNotifications : notificationService.getMyNotifications;
      const res = await endpoint(token);
      setNotifications(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, [activeTab]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id, token);
      loadNotifications();
    } catch (err) { setError('Failed to mark as read'); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id, token);
      loadNotifications();
    } catch (err) { setError('Failed to delete'); }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all your notifications?')) return;
    try {
      await notificationService.clearAll(token);
      loadNotifications();
    } catch (err) { setError('Failed to clear'); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await notificationService.sendNotification(sendForm, token);
      setSendForm({ userId: '', type: 'REMINDER', message: '' });
      alert('Notification sent!');
    } catch (err) { setError(err.response?.data?.message || 'Failed to send'); }
  };

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-header-left">
          <div className="umt-logo-sm">UMT</div>
          <div>
            <div className="dash-title">Smart Campus Support System</div>
            <div className="dash-subtitle">Notification Service</div>
          </div>
        </div>
        <div className="dash-header-right">
          <span className="user-info">👤 {user?.name || 'User'} ({user?.role})</span>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="dash-content">
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Notifications</div>
            <button className={`sidebar-btn ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>🔔 My Notifications</button>
            {user?.role === 'admin' && (
              <button className={`sidebar-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>📋 All Notifications</button>
            )}
            {user?.role === 'admin' && (
              <button className={`sidebar-btn ${activeTab === 'send' ? 'active' : ''}`} onClick={() => setActiveTab('send')}>📤 Send Notification</button>
            )}
          </div>
        </aside>

        <main className="main-content">
          {error && <div className="error-msg" onClick={() => setError('')}>{error} ✕</div>}

          {activeTab !== 'send' && (
            <>
              <div className="page-header">
                <h2>{activeTab === 'my' ? 'My Notifications' : 'All Notifications'}</h2>
                <div className="header-actions">
                  <button className="btn-outline" onClick={loadNotifications}>🔄 Refresh</button>
                  {activeTab === 'my' && <button className="btn-danger-outline" onClick={handleClearAll}>🗑️ Clear All</button>}
                </div>
              </div>
              {loading ? (
                <div className="loading">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">🔔</div><p>No notifications</p></div>
              ) : (
                <div className="notif-list">
                  {notifications.map(n => (
                    <div key={n._id} className={`notif-item ${n.isRead ? '' : 'unread'}`}>
                      <div className="notif-icon">{TYPE_ICONS[n.type] || '🔔'}</div>
                      <div className="notif-body">
                        <div className="notif-type">{n.type.replace(/_/g, ' ')}</div>
                        <div className="notif-message">{n.message}</div>
                        <div className="notif-time">{timeAgo(n.createdAt)}</div>
                      </div>
                      <div className="notif-actions">
                        {!n.isRead && <button onClick={() => handleMarkRead(n._id)}>✓ Read</button>}
                        <button className="danger" onClick={() => handleDelete(n._id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'send' && (
            <>
              <div className="page-header"><h2>Send Notification</h2></div>
              <div className="form-card">
                <form onSubmit={handleSend}>
                  <div className="form-group">
                    <label>User ID *</label>
                    <input type="text" value={sendForm.userId} onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })} placeholder="e.g. user-student-001" required />
                  </div>
                  <div className="form-group">
                    <label>Type *</label>
                    <select value={sendForm.type} onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })}>
                      {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Message *</label>
                    <textarea value={sendForm.message} onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })} rows="3" placeholder="Enter notification message..." required />
                  </div>
                  <button type="submit" className="btn-primary">📤 Send Notification</button>
                </form>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
