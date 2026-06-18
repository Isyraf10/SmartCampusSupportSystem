/**
 * config.js — notificationService frontend
 *
 * DASHBOARD_LOGIN_URL  — where to redirect on logout or expired token
 * IDENTITY_VERIFY_URL  — proxied through Vite (dev) so the real Identity
 *                        Service URL never leaks into compiled JS bundles
 *
 * In development: Vite proxy forwards /identity → http://localhost:5000
 */

const DASHBOARD_LOGIN_URL =
  import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000/login';

const IDENTITY_VERIFY_URL =
  import.meta.env.VITE_IDENTITY_URL || '/identity/auth/verify-token';

export { DASHBOARD_LOGIN_URL, IDENTITY_VERIFY_URL };
