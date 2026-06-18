import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import './Pages.css';

const TYPE_ICONS = {
    EVENT_REGISTRATION: '🎟️',
    EVENT_CANCELLATION: '❌',
    REMINDER: '⏰',
    BOOKING_CONFIRMATION: '✅',
    ANNOUNCEMENT: '📢',
};
const TYPE_COLORS = {
    EVENT_REGISTRATION: '#7c3aed',
    EVENT_CANCELLATION: '#dc2626',
    REMINDER: '#d97706',
    BOOKING_CONFIRMATION: '#059669',
    ANNOUNCEMENT: '#0284c7',
};
const TYPES = ['REMINDER', 'BOOKING_CONFIRMATION', 'EVENT_REGISTRATION', 'EVENT_CANCELLATION', 'ANNOUNCEMENT'];

export default function Dashboard() {
    const { user, logout, getToken } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sendForm, setSendForm] = useState({ userId: '', type: 'REMINDER', message: '' });
    const [sending, setSending] = useState(false);
    const [activeTab, setActiveTab] = useState('my');
    const [serviceOnline, setServiceOnline] = useState(true);
    const [users, setUsers] = useState([]);

    const token = getToken();

    useEffect(() => {
        if (user?.role === 'admin' && token) {
            fetch('http://localhost:5000/api/v1/users', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(r => r.json())
            .then(data => setUsers(data?.data?.users || data?.data || []))
            .catch(() => {});
        }
    }, [token, user]);

    const loadNotifications = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError('');
        try {
            const endpoint = activeTab === 'all'
                ? notificationService.getAllNotifications
                : notificationService.getMyNotifications;
            const res = await endpoint(token);
            setNotifications(res?.data || []);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to load notifications';
            setError(msg);
            if (err.code === 'ERR_NETWORK') setServiceOnline(false);
        } finally {
            setLoading(false);
        }
    }, [activeTab, token]);

    useEffect(() => { loadNotifications(); }, [loadNotifications]);

    useEffect(() => {
        notificationService.healthCheck()
            .then(() => setServiceOnline(true))
            .catch(() => setServiceOnline(false));
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await notificationService.markAsRead(id, token);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) { setError('Failed to mark as read'); }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.deleteNotification(id, token);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) { setError('Failed to delete'); }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Clear all your notifications?')) return;
        try {
            await notificationService.clearAll(token);
            setNotifications([]);
            setSuccess('All notifications cleared.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) { setError('Failed to clear'); }
    };

    const handleSend = async () => {
        if (!sendForm.userId || !sendForm.message) {
            setError('User and message are required.');
            return;
        }
        setSending(true);
        setError('');
        try {
            await notificationService.sendNotification(sendForm);
            setSendForm({ userId: '', type: 'REMINDER', message: '' });
            setSuccess('Notification sent successfully!');
            setTimeout(() => setSuccess(''), 3000);
            setActiveTab('my');
            loadNotifications();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send notification');
        } finally {
            setSending(false);
        }
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

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

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
                    <div className="service-status">
                        <span className={`status-dot ${serviceOnline ? '' : 'offline'}`}></span>
                        {serviceOnline ? 'Service Online' : 'Service Offline'}
                    </div>
                    <div className="user-badge">
                        <div className="user-avatar">{initials}</div>
                        <span>{user?.name || 'User'}</span>
                        <span className="role-badge">{user?.role || 'student'}</span>
                    </div>
                    <button className="btn-logout" onClick={logout}>Sign Out</button>
                </div>
            </header>

            <div className="dash-content">
                <aside className="sidebar">
                    <div className="sidebar-label">Notifications</div>
                    <button
                        className={`sidebar-btn ${activeTab === 'my' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my')}
                    >
                        🔔 My Notifications
                        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                    </button>

                    {user?.role === 'admin' && (
                        <>
                            <div className="sidebar-divider" />
                            <div className="sidebar-label">Admin</div>
                            <button
                                className={`sidebar-btn ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >
                                📋 All Notifications
                            </button>
                            <button
                                className={`sidebar-btn ${activeTab === 'send' ? 'active' : ''}`}
                                onClick={() => setActiveTab('send')}
                            >
                                📤 Send Notification
                            </button>
                        </>
                    )}
                </aside>

                <main className="main-content">
                    {error && (
                        <div className="error-msg" onClick={() => setError('')}>
                            <span>{error}</span><span>✕</span>
                        </div>
                    )}
                    {success && <div className="success-msg">✓ {success}</div>}

                    {activeTab !== 'send' && (
                        <>
                            <div className="page-header">
                                <h2>{activeTab === 'my' ? 'My Notifications' : 'All Notifications'}</h2>
                                <div className="header-actions">
                                    <button className="btn-outline" onClick={loadNotifications}>↻ Refresh</button>
                                    {activeTab === 'my' && notifications.length > 0 && (
                                        <button className="btn-danger-outline" onClick={handleClearAll}>🗑 Clear All</button>
                                    )}
                                </div>
                            </div>

                            {activeTab === 'my' && (
                                <div className="stats-row">
                                    <div className="stat-card">
                                        <span className="stat-icon">🔔</span>
                                        <div>
                                            <div className="stat-label">Total</div>
                                            <div className="stat-value">{notifications.length}</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-icon">⚡</span>
                                        <div>
                                            <div className="stat-label">Unread</div>
                                            <div className="stat-value" style={{ color: unreadCount > 0 ? '#d97706' : '#059669' }}>
                                                {unreadCount}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-icon">✅</span>
                                        <div>
                                            <div className="stat-label">Read</div>
                                            <div className="stat-value" style={{ color: '#059669' }}>
                                                {notifications.length - unreadCount}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <div className="loading"><span>⏳</span> Loading notifications...</div>
                            ) : notifications.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">🔔</div>
                                    <p>No notifications yet</p>
                                    <small>New notifications will appear here</small>
                                </div>
                            ) : (
                                <div className="notif-list">
                                    {notifications.map(n => (
                                        <div key={n._id} className={`notif-item ${n.isRead ? '' : 'unread'}`}>
                                            <div className="notif-icon">{TYPE_ICONS[n.type] || '🔔'}</div>
                                            <div className="notif-body">
                                                <div className="notif-meta">
                                                    <span
                                                        className="notif-type"
                                                        style={{ color: TYPE_COLORS[n.type] || '#003580', background: `${TYPE_COLORS[n.type]}15` }}
                                                    >
                                                        {n.type.replace(/_/g, ' ')}
                                                    </span>
                                                    {!n.isRead && <span className="unread-dot" />}
                                                </div>
                                                <div className="notif-message">{n.message}</div>
                                                <div className="notif-time">{timeAgo(n.createdAt)}</div>
                                            </div>
                                            <div className="notif-actions">
                                                {!n.isRead && (
                                                    <button onClick={() => handleMarkRead(n._id)}>✓ Read</button>
                                                )}
                                                <button className="danger" onClick={() => handleDelete(n._id)}>🗑</button>
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
                                <h3>📤 New Notification</h3>
                                <div className="form-group">
                                    <label>Recipient User *</label>
                                    {users.length > 0 ? (
                                        <select
                                            value={sendForm.userId}
                                            onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })}
                                        >
                                            <option value="">-- Select a user --</option>
                                            {users.map(u => (
                                                <option key={u._id} value={u._id}>
                                                    {u.name} ({u.matricNumber}) — {u.role}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={sendForm.userId}
                                            onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })}
                                            placeholder="e.g. 6a289ec232083687a1058172"
                                        />
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Notification Type *</label>
                                    <select
                                        value={sendForm.type}
                                        onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })}
                                    >
                                        {TYPES.map(t => (
                                            <option key={t} value={t}>{TYPE_ICONS[t]} {t.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Message *</label>
                                    <textarea
                                        value={sendForm.message}
                                        onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                                        rows="4"
                                        placeholder="Enter your notification message..."
                                    />
                                </div>
                                <button className="btn-primary" onClick={handleSend} disabled={sending}>
                                    {sending ? 'Sending...' : '📤 Send Notification'}
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}