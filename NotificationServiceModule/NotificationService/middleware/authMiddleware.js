/**
 * Authentication Middleware for Notification Service
 * SOA Principle: Identity Service is the single source of truth for authentication
 */
const axios = require('axios');
const { AppError } = require('../utils/errorHandler');
const { API_CONTRACTS } = require('../constants/apiConstants');

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:5000';

/**
 * Verify token by calling Identity Service
 * Sends token in Authorization header (correct SOA pattern)
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError(API_CONTRACTS.ERROR_MESSAGES.UNAUTHORIZED, 401));
        }

        const token = authHeader.split(' ')[1];

        // Call Identity Service to verify token
        // Send token in BOTH header (for middleware) and body (for controller)
        const response = await axios.post(
            `${IDENTITY_SERVICE_URL}/api/v1/auth/verify-token`,
            { token },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        req.user = response.data?.data?.user || response.data?.user || response.data;
        next();
    } catch (error) {
        if (error.response) {
            return next(new AppError(API_CONTRACTS.ERROR_MESSAGES.INVALID_TOKEN, 401));
        }
        return next(new AppError(API_CONTRACTS.ERROR_MESSAGES.IDENTITY_UNAVAILABLE, 503));
    }
};

/**
 * Admin only access
 */
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return next(new AppError(API_CONTRACTS.ERROR_MESSAGES.FORBIDDEN, 403));
    }
    next();
};

module.exports = { verifyToken, isAdmin };
