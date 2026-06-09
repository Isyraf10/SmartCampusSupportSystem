import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DASHBOARD_LOGIN_URL, IDENTITY_VERIFY_URL } from '../config';

/**
 * Reads ?token= from the URL on mount, persists it to localStorage,
 * then strips it from the address bar so it never enters browser history.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
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
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
    return false;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');

    if (urlToken) {
      localStorage.setItem('accessToken', urlToken);
      window.history.replaceState({}, '', window.location.pathname);
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = DASHBOARD_LOGIN_URL;
      return;
    }

    const cached = localStorage.getItem('user');
    if (cached) {
      setUser(JSON.parse(cached));
      setLoading(false);
      verifyToken(token).then((ok) => {
        if (!ok) window.location.href = DASHBOARD_LOGIN_URL;
      });
      return;
    }

    verifyToken(token).then((ok) => {
      if (!ok) window.location.href = DASHBOARD_LOGIN_URL;
      setLoading(false);
    });
  }, [verifyToken]);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = DASHBOARD_LOGIN_URL;
  };

  return { user, loading, logout, isAdmin: user?.role?.toLowerCase() === 'admin' };
}
