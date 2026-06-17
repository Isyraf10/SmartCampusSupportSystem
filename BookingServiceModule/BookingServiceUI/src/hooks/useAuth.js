import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DASHBOARD_LOGIN_URL, IDENTITY_VERIFY_URL } from '../config';

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const verifyToken = useCallback(async (token) => {
    try {
      const response = await axios.post(
        IDENTITY_VERIFY_URL,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const verifiedUser = response.data?.data?.user;
      if (verifiedUser) {
        localStorage.setItem('user', JSON.stringify(verifiedUser));
        setUser(verifiedUser);
        return true;
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
    return false;
  }, []);

  useEffect(() => {
    const init = async () => {
      const params   = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');

      if (urlToken) {
        localStorage.setItem('accessToken', urlToken);
        window.history.replaceState({}, '', window.location.pathname);
      }

      const token = localStorage.getItem('accessToken');

      // Security Enabled: Kick out if no token
      if (!token) {
        window.location.href = DASHBOARD_LOGIN_URL; 
        return;
      }

      const cached = localStorage.getItem('user');
      if (cached) {
        setUser(JSON.parse(cached));
        setLoading(false);
        
        // Background verify
        const ok = await verifyToken(token);
        if (!ok) window.location.href = DASHBOARD_LOGIN_URL; 
        return;
      }

      const ok = await verifyToken(token);
      if (!ok) {
        window.location.href = DASHBOARD_LOGIN_URL;
      }
      setLoading(false);
    };

    init();
  }, [verifyToken]);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = DASHBOARD_LOGIN_URL;
  };

  return {
    user,
    loading,
    logout,
    isAdmin: user?.role?.toLowerCase() === 'admin',
  };
}