import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                height: '100vh', fontSize: '16px', color: '#003580',
                fontFamily: 'Inter, Segoe UI, sans-serif', gap: '10px',
                background: '#f0f4fa'
            }}>
                <span>⏳</span> Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to Identity Service UI for login
        return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',fontFamily:'Inter,sans-serif',color:'#003580',flexDirection:'column',gap:'16px',background:'#f0f4fa'}}><span style={{fontSize:'48px'}}>🔐</span><h2>Please login via Identity Service</h2><p style={{color:'#64748b'}}>Go to http://localhost:3000 to login first</p></div>;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
