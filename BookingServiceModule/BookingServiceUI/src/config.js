const DASHBOARD_LOGIN_URL =
  import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000/login';

// Proxied via Vite (dev) or nginx (prod) — avoids baking backend URLs into compiled JS
const IDENTITY_VERIFY_URL =
  import.meta.env.VITE_IDENTITY_URL || '/identity/auth/verify-token';

export { DASHBOARD_LOGIN_URL, IDENTITY_VERIFY_URL };
