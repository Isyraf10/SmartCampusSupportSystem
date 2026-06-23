import axios from 'axios';

// Use relative path so nginx proxies requests to support-service:5003
// This works both in Docker (via nginx) and in local dev (via Vite proxy)
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token from localStorage on every request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Unwrap response.data automatically; redirect to login on 401
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = 'http://localhost:3000/login';
    }
    return Promise.reject(error.response?.data || error.message || error);
  }
);

export default axiosClient;
