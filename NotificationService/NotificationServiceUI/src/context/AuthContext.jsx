import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const IDENTITY_URL = import.meta.env.VITE_IDENTITY_URL || 'http://localhost:5000/api/v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const res = await axios.post(`${IDENTITY_URL}/auth/login`, { email, password });
    const data = res.data?.data || res.data;
    const accessToken = data.accessToken || data.token;
    setToken(accessToken);
    setUser(data.user);
    localStorage.setItem('token', accessToken);
    return data;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
