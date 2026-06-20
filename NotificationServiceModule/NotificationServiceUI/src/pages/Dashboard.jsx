import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import notificationService from '../services/notificationService'
import './Pages.css'

const TYPE_ICONS = {
    EVENT_REGISTRATION: '🎟️',
    EVENT_CANCELLATION: '❌',
    REMINDER: '⏰',
    BOOKING_CONFIRMATION: '✅',
    ANNOUNCEMENT: '📢'
}
const TYPE_COLORS = {
    EVENT_REGISTRATION: '#7c3aed',
    EVENT_CANCELLATION: '#dc2626',
    REMINDER: '#d97706',
    BOOKING_CONFIRMATION: '#059669',
    ANNOUNCEMENT: '#0284c7'
}
const TYPES = ['REMINDER', 'BOOKING_CONFIRMATION', 'EVENT_REGISTRATION', 'EVENT_CANCELLATION', 'ANNOUNCEMENT']

export default function Dashboard() {
    const { user, logout, getToken } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [sending, setSending] = useState(false)
    const [activeTab, setActiveTab] = useState('my')
    const [serviceOnline, setServiceOnline] = useState(true)
    const token = getToken()

    const [sendForm, setSendForm] = useState({
        targetAudience: 'ALL',
        recipientId: '',
        type: 'REMINDER',
        message: '',
        eventName: '',
        eventDate: '',
        eventTime: '',
        eventLocation: '',
        eventMerit: '',
        eventFee: 'Free',
        eventOrganizer: ''
    })

    const loadNotifications = useCallback(async () => {
        if (!token) return
        setLoading(true)
        setError('')
        try {
            const endpoint = activeTab === 'all'
                ? notificationService.getAllNotifications
                : notificationService.getMyNotifications

            const res = await endpoint(token)
            
            let extractedArray = []
            if (Array.isArray(res.data?.data)) {
                extractedArray = res.data.data
            } else if (Array.isArray(res.data?.payload)) {
                extractedArray = res.data.payload
            } else if (Array.isArray(res.data)) {
                extractedArray = res.data
            } else if (res.data && typeof res.data === 'object') {
                const possibleArray = Object.values(res.data).find(val => Array.isArray(val))
                if (possibleArray) extractedArray = possibleArray
            }

            setNotifications(extractedArray)
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to load notifications'
            setError(msg)
            if (err.code === 'ERR_NETWORK') setServiceOnline(false)
        } finally {
            setLoading(false)
        }
    }, [activeTab, token])

    useEffect(() => { loadNotifications() }, [loadNotifications])

    useEffect(() => {
        notificationService.healthCheck()
            .then(() => setServiceOnline(true))
            .catch(() => setServiceOnline(false))
    }, [])

    const handleMarkRead = async (id) => {
        try {
            await notificationService.markAsRead(id, token)
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
        } catch (err) { setError('Failed to mark as read') }
    }

    const handleDelete = async (id) => {
        try {
            await notificationService.deleteNotification(id, token)
            setNotifications(prev => prev.filter(n => n._id !== id))
        } catch (err) { setError('Failed to delete') }
    }

    const handleClearAll = async () => {
        if (!window.confirm('Clear all your notifications?')) return
        try {
            await notificationService.clearAll(token)
            setNotifications([])
            setSuccess('All notifications cleared.')
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) { setError('Failed to clear') }
    }

    const handleSend = async () => {
        if (sendForm.targetAudience === 'INDIVIDUAL' && !sendForm.recipientId) {
            setError('Recipient Email or ID is required.')
            return
        }

        let finalMessage = sendForm.message;
        let metadata = {};

        // Route specific validation and payload generation for Events
        if (sendForm.type === 'EVENT_REGISTRATION') {
            if (!sendForm.eventName || !sendForm.eventDate || !sendForm.eventLocation) {
                setError('Event Name, Date, and Location are strictly required.')
                return
            }
            finalMessage = sendForm.message || `You are invited to ${sendForm.eventName}!`
            metadata = {
                eventName: sendForm.eventName,
                eventDate: sendForm.eventDate,
                eventTime: sendForm.eventTime,
                eventLocation: sendForm.eventLocation,
                eventMerit: sendForm.eventMerit,
                eventFee: sendForm.eventFee,
                eventOrganizer: sendForm.eventOrganizer
            }
        } else {
            if (!sendForm.message) {
                setError('Notification message text content is required.')
                return
            }
        }

        setSending(true)
        setError('')
        try {
            const payload = {
                targetAudience: sendForm.targetAudience,
                recipientId: sendForm.recipientId,
                type: sendForm.type,
                message: finalMessage,
                metadata: metadata
            }

            await notificationService.sendNotification(payload, token)
            setSendForm({ 
                targetAudience: 'ALL', recipientId: '', type: 'REMINDER', message: '',
                eventName: '', eventDate: '', eventTime: '', eventLocation: '', eventMerit: '', eventFee: 'Free', eventOrganizer: ''
            })
            setSuccess('Broadcast queued successfully!')
            setTimeout(() => setSuccess(''), 3000)
            setActiveTab('all')
            loadNotifications()
        } catch (err) {
            const errorDetail = err.response?.data?.errors?.[0]
            const errorMessage = err.response?.data?.message
            setError(errorDetail || errorMessage || 'Failed to send notification')
        } finally {
            setSending(false)
        }
    }

    const timeAgo = (iso) => {
        const diff = Date.now() - new Date(iso)
        const m = Math.floor(diff / 60000)
        if (m < 1) return 'Just now'
        if (m < 60) return `${m}m ago`
        const h = Math.floor(m / 60)
        if (h < 24) return `${h}h ago`
        return `${Math.floor(h / 24)}d ago`
    }

    const unreadCount = notifications.filter(n => !n.isRead).length
    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'U'

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
                                                
                                                <div className="notif-message">
                                                    {n.type === 'EVENT_REGISTRATION' && n.metadata && n.metadata.eventName ? (
                                                        <div className="event-card">
                                                            <h4>🎟️ {n.metadata.eventName}</h4>
                                                            <p><strong>📅 Date & Time:</strong> {n.metadata.eventDate} {n.metadata.eventTime && `at ${n.metadata.eventTime}`}</p>
                                                            <p><strong>📍 Location:</strong> {n.metadata.eventLocation}</p>
                                                            {n.metadata.eventMerit && <p><strong>⭐ Merit Points:</strong> {n.metadata.eventMerit}</p>}
                                                            <p><strong>💰 Fee:</strong> {n.metadata.eventFee}</p>
                                                            {n.metadata.eventOrganizer && <p><strong>🏢 Organizer:</strong> {n.metadata.eventOrganizer}</p>}
                                                            
                                                            {n.message && !n.message.includes('You are invited to') && (
                                                                <p style={{ marginTop: '10px' }}><strong>📝 Remarks:</strong> {n.message}</p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        n.message
                                                    )}
                                                </div>

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
                            <div className="page-header"><h2>Send Notification center</h2></div>
                            <div className="form-card">
                                <h3>📢 Create New Broadcast</h3>

                                <div className="form-group">
                                    <label>Target Audience *</label>
                                    <select
                                        value={sendForm.targetAudience}
                                        onChange={(e) => setSendForm({ ...sendForm, targetAudience: e.target.value })}
                                    >
                                        <option value="ALL">All Campus Users (Students & Staff)</option>
                                        <option value="STUDENT">All Students Only</option>
                                        <option value="STAFF">All Staff Members Only</option>
                                        <option value="LECTURER">All Lecturers Only</option>
                                        <option value="STUDENT_STAFF">Student and Staff</option>
                                        <option value="LECTURER_STUDENT">Lecturer and Student</option>
                                        <option value="ADMIN">Admin Only</option>
                                        <option value="INDIVIDUAL">Specific ID (Email or Register ID)</option>
                                    </select>
                                </div>

                                {sendForm.targetAudience === 'INDIVIDUAL' && (
                                    <div className="form-group">
                                        <label>Recipient (Email or ID) *</label>
                                        <input
                                            type="text"
                                            value={sendForm.recipientId}
                                            onChange={(e) => setSendForm({ ...sendForm, recipientId: e.target.value })}
                                            placeholder="e.g. student@umt.edu.my or S12345"
                                        />
                                    </div>
                                )}

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

                                {/* CONDITIONAL RENDERING: Event fields vs Standard message box */}
                                {sendForm.type === 'EVENT_REGISTRATION' ? (
                                    <div className="event-form-fields">
                                        <div className="form-group">
                                            <label>Event Name *</label>
                                            <input type="text" value={sendForm.eventName} onChange={e => setSendForm({...sendForm, eventName: e.target.value})} placeholder="e.g. Annual Tech Symposium" />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Date *</label>
                                                <input type="date" value={sendForm.eventDate} onChange={e => setSendForm({...sendForm, eventDate: e.target.value})} />
                                            </div>
                                            <div className="form-group">
                                                <label>Time</label>
                                                <input type="time" value={sendForm.eventTime} onChange={e => setSendForm({...sendForm, eventTime: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Location (Where) *</label>
                                            <input type="text" value={sendForm.eventLocation} onChange={e => setSendForm({...sendForm, eventLocation: e.target.value})} placeholder="e.g. Dewan Sultan Mizan" />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Merit Points</label>
                                                <input type="number" value={sendForm.eventMerit} onChange={e => setSendForm({...sendForm, eventMerit: e.target.value})} placeholder="e.g. 10" />
                                            </div>
                                            <div className="form-group">
                                                <label>Registration Fee</label>
                                                <input type="text" value={sendForm.eventFee} onChange={e => setSendForm({...sendForm, eventFee: e.target.value})} placeholder="e.g. Free or RM 15" />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Organized By</label>
                                            <input type="text" value={sendForm.eventOrganizer} onChange={e => setSendForm({...sendForm, eventOrganizer: e.target.value})} placeholder="e.g. Computer Science Club" />
                                        </div>
                                        <div className="form-group">
                                            <label>Additional Remarks</label>
                                            <textarea value={sendForm.message} onChange={e => setSendForm({...sendForm, message: e.target.value})} rows="2" placeholder="Any extra details..." />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label>Message Text *</label>
                                        <textarea
                                            value={sendForm.message}
                                            onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                                            rows="4"
                                            placeholder="Enter announcement details..."
                                        />
                                    </div>
                                )}

                                <button className="btn-primary" onClick={handleSend} disabled={sending}>
                                    {sending ? 'Processing...' : '📢 Dispatch Notification'}
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}