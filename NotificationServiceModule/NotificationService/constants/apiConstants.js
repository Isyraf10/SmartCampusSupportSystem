/**
 * API Constants & Contracts for Notification Service
 * SOA Principle: API Contract defines service boundaries
 */

const API_CONTRACTS = {
    SERVICE_NAME: 'Notification Service',
    SERVICE_PORT: process.env.PORT || 5003,
    SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5003',

    // Connected services
    IDENTITY_SERVICE_URL: process.env.IDENTITY_SERVICE_URL || 'http://localhost:5000',
    BOOKING_SERVICE_URL:  process.env.BOOKING_SERVICE_URL  || 'http://localhost:5002',
    SUPPORT_SERVICE_URL:  process.env.SUPPORT_SERVICE_URL  || 'http://localhost:5004',

    NOTIFICATIONS: {
        GET_MY:   '/api/v1/notifications/my',
        GET_ALL:  '/api/v1/notifications',
        GET_BY_ID: '/api/v1/notifications/:id',
        SEND:     '/api/v1/notifications',
        MARK_READ: '/api/v1/notifications/:id/read',
        DELETE:   '/api/v1/notifications/:id',
        CLEAR_ALL: '/api/v1/notifications/my/all',
    },

    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
        SERVICE_UNAVAILABLE: 503,
    },

    ERROR_MESSAGES: {
        UNAUTHORIZED: 'Unauthorized - Token required',
        INVALID_TOKEN: 'Invalid or expired token',
        FORBIDDEN: 'Forbidden - Insufficient permissions',
        NOT_FOUND: 'Notification not found',
        MISSING_FIELDS: 'userId, type, and message are required',
        IDENTITY_UNAVAILABLE: 'Identity Service unavailable. Please try again later.',
        SERVER_ERROR: 'Internal server error',
    },

    SUCCESS_MESSAGES: {
        NOTIFICATION_SENT: 'Notification sent successfully',
        NOTIFICATION_DELETED: 'Notification deleted successfully',
        MARKED_AS_READ: 'Notification marked as read',
        CLEARED: 'All notifications cleared',
    },
};

const RESPONSE_CONTRACT = {
    SUCCESS: (data, message = 'Operation successful') => ({
        success: true,
        status: 200,
        message,
        data,
        timestamp: new Date().toISOString(),
    }),
    ERROR: (status = 500, message = 'Server error', errors = null) => ({
        success: false,
        status,
        message,
        errors,
        timestamp: new Date().toISOString(),
    }),
    CREATED: (data, message = 'Resource created') => ({
        success: true,
        status: 201,
        message,
        data,
        timestamp: new Date().toISOString(),
    }),
};

module.exports = { API_CONTRACTS, RESPONSE_CONTRACT };
