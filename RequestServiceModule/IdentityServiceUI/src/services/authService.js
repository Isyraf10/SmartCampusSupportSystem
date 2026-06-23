/**
 * Authentication Service
 * Handles API calls to Identity Service
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const authService = {
    /**
     * Login with Google OAuth
     */
    loginWithGoogle: async (idToken) => {
        try {
            const response = await axios.post(`${API_URL}/auth/google`, { token: idToken });
            if (response.data.success) {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
            return response.data;
        } catch (error) {
            console.error("Google Login Error Detail:", error.response?.data);
            throw error.response?.data?.message || 'Google Login failed. Please try again.';
        }
    },

    /**
     * Register new user
     */
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData);
            if (response.data.success) {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
            return response.data;
        // Dalam catch block authService.js
        } catch (error) {
            console.error("Backend Error Detail:", error.response?.data); // NI PALING PENTING
            throw error.response?.data?.message || 'Something went wrong';
        }
    },

    /**
     * Login user
     */
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            if (response.data.success) {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Logout user
     */
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    /**
     * Get current user from localStorage
     */
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    /**
     * Get access token
     */
    getAccessToken: () => {
        return localStorage.getItem('accessToken');
    },

    /**
     * Verify token is valid
     */
    verifyToken: async (token) => {
        try {
            const response = await axios.post(
                `${API_URL}/auth/verify-token`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data.success;
        } catch (error) {
            return false;
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: () => {
        const token = localStorage.getItem('accessToken');
        return !!token;
    }
};

export default authService;


