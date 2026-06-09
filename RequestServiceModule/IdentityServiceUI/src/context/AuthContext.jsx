import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            const userData = localStorage.getItem('user');
            setUser(userData ? JSON.parse(userData) : null);
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            if (response.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return response;
            }
            throw new Error(response.message || 'Login failed');
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            if (response.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return response;
            }
            throw new Error(response.message || 'Registration failed');
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
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
