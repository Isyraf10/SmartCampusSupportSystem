import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DASHBOARD_LOGIN_URL, IDENTITY_VERIFY_URL } from '../config';

/**
 * useAuth — bookingService DONE
 *
 * On mount:
 * 1. Reads ?token= from URL → saves to localStorage → strips from address bar
 * 2. Falls back to existing localStorage token if no URL token
 * 3. If no token at all → redirects to requestService login page
 * 4. Verifies token against Identity Service
 * 5. Serves cached user instantly while verify runs in background
 */
export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Verify token against Identity Service ────────────────────────────────
  const verifyToken = useCallback(async (token) => {
    try {
      console.log('Testing Verify Token API with:', token); // 👈 CCTV 1
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
      // 👈 CCTV 2: Kat sini kita nak tengok kalau backend reject atau error network
      console.error('Verify Token Failed beb:', error.response?.data || error.message);
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
    return false;
  }, []);

  // ── Bootstrap on mount ───────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const params   = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');

      console.log('Token dari URL:', urlToken); // 👈 CCTV 3
      console.log('Token dari Storage:', localStorage.getItem('accessToken')); // 👈 CCTV 4

      if (urlToken) {
        // Persist token so page refreshes keep the user logged in
        localStorage.setItem('accessToken', urlToken);
        // Remove token from URL — keeps browser history clean and safe
        window.history.replaceState({}, '', window.location.pathname);
      }

      // Step 2: Read from localStorage (covers both fresh redirect and refresh)
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.log("Sepatutnya kena tendang (No token)");
        // 🛑 REDIRECT DITUTUP SEMENTARA
        // window.location.href = DASHBOARD_LOGIN_URL; 
        return;
      }

      // Step 3: Serve cached user immediately so UI renders without waiting
      const cached = localStorage.getItem('user');
      if (cached) {
        setUser(JSON.parse(cached));
        setLoading(false);

        // Step 4: Silently re-verify in background — kicks out expired tokens
        const ok = await verifyToken(token);
        if (!ok) {
           console.log("Sepatutnya kena tendang (Token failed at Step 4)");
           // 🛑 REDIRECT DITUTUP SEMENTARA
           // window.location.href = DASHBOARD_LOGIN_URL; 
        }
        return;
      }

      // Step 5: No cached user — must verify before showing anything
      const ok = await verifyToken(token);
      if (!ok) {
          console.log("Sepatutnya kena tendang (Token failed at Step 5)");
          // 🛑 REDIRECT DITUTUP SEMENTARA
          // window.location.href = DASHBOARD_LOGIN_URL; 
      }
      setLoading(false);
    };

    init();
  }, [verifyToken]);

  // ── Logout ───────────────────────────────────────────────────────────────
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