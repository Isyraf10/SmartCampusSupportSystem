/**DONE
 * AuthContext.js — requestService frontend
 *
 * Provides user state, login, register, and logout to the whole app.
 * Token and user data are persisted in localStorage so page refreshes
 * keep the user logged in.
 * 
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,            setUser]            = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading,         setLoading]         = useState(true);

  // ── Rehydrate from localStorage on first load ──────────────────────────────
  useEffect(() => {
    const token    = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (token) {
      setUser(userData ? JSON.parse(userData) : null);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
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

  // ── Google Login ───────────────────────────────────────────────────────────
  const loginWithGoogle = async (idToken) => {
    try {
      const response = await authService.loginWithGoogle(idToken);
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      }
      throw new Error(response.message || 'Google login failed');
    } catch (error) {
      throw error;
    }
  };

  // ── Register ───────────────────────────────────────────────────────────────
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

  // ── Logout ─────────────────────────────────────────────────────────────────
  // Called by Dashboard handleLogout — clears everything then navigate('/login')
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, loginWithGoogle, register, logout }}>
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
