/**
 * Dashboard Page - Central Hub for Smart Campus SOA
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

// TEMPATLETAK URL FRONTEND
// Kalau dah deploy, tukar je localhost ni pergi link sebenar.
const SERVICE_URLS = {
    booking: 'http://localhost:5002',      // Frontend Booking Module
    itSupport: 'http://localhost:3002',    // Frontend IT/Academic Support
    notification: 'http://localhost:3003'  // Frontend Notification
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Ambil token dari storan untuk dipass ke servis lain
    const token = localStorage.getItem('accessToken');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Fungsi untuk hantar user & token ke modul kawan kau
    const goToService = (serviceUrl) => {
        if (!token) {
            alert("Sesi tamat. Sila login semula.");
            return;
        }
        // Kita sangkutkan token kat hujung URL (Query Parameter)
        window.location.href = `${serviceUrl}?token=${token}`;
    };

    // Style untuk butang navigasi (supaya nampak seragam)
    const navBtnStyle = {
        padding: '10px 15px',
        backgroundColor: '#4c51bf',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        flex: '1',
        margin: '0 5px'
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '600px' }}>
                <div className="auth-header">
                    <h1>Welcome to Smart Campus Support System</h1>
                    <p>Central Dashboard</p>

                    {/* --- MODULE NAVIGATION BUTTONS --- */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <button
                            style={navBtnStyle}
                            onClick={() => goToService(SERVICE_URLS.booking)}
                        >
                            Booking
                        </button>
                        <button
                            style={navBtnStyle}
                            onClick={() => goToService(SERVICE_URLS.itSupport)}
                        >
                            IT Support
                        </button>
                        <button
                            style={navBtnStyle}
                            onClick={() => goToService(SERVICE_URLS.notification)}
                        >
                            Notifications
                        </button>
                    </div>
                    {/* ---------------------------------- */}
                </div>

                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                            User Profile
                        </p>
                        <div style={{
                            backgroundColor: '#f5f5f5',
                            padding: '15px',
                            borderRadius: '8px',
                            textAlign: 'left',
                            marginBottom: '20px'
                        }}>
                            <p style={{ margin: '8px 0' }}>
                                <strong>Name:</strong> {user?.name || 'N/A'}
                            </p>
                            <p style={{ margin: '8px 0' }}>
                                <strong>Email:</strong> {user?.email || 'N/A'}
                            </p>
                            <p style={{ margin: '8px 0' }}>
                                <strong>Role:</strong> {user?.role || 'N/A'}
                            </p>
                            {user?.matricNumber && (
                                <p style={{ margin: '8px 0' }}>
                                    <strong>Matric Number:</strong> {user.matricNumber}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#e53e3e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}