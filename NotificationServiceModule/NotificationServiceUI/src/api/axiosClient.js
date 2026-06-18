/**
 * axiosClient.js — notificationService frontend
 *
 * A pre-configured axios instance that:
 *  - Points to the notification backend (via Vite proxy in dev)
 *  - Automatically attaches the Bearer token from localStorage to every request
 *  - On 401 response: clears storage and redirects to Dashboard login
 */

import axios from 'axios';
import { DASHBOARD_LOGIN_URL } from '../config';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 10000,
});

// ── Request interceptor — attach token ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle expired/invalid token ──────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = DASHBOARD_LOGIN_URL;
    }
    return Promise.reject(error);
  }
);

export default api;
