import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Read token saved by RequestServiceModule (IdentityServiceUI)
        const token = localStorage.getItem('accessToken');
        if (token) {
            const userData = localStorage.getItem('user');
            setUser(userData ? JSON.parse(userData) : null);
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        // Redirect to Identity Service UI login page
        window.location.href = import.meta.env.VITE_IDENTITY_UI_URL || 'http://localhost:3000/login';
    };

    // Get token for API calls
    const getToken = () => localStorage.getItem('accessToken');

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, logout, getToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
