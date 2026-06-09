/**
 * API Constants & Contracts for Notification Service
 * SOA Principle: API Contract defines service boundaries
 */

const API_CONTRACTS = {
  // Service identification
  SERVICE_NAME: 'Notification Service',
  SERVICE_PORT: process.env.PORT || 5003,
  SERVICE_URL: 'http://localhost:5003',

  // API Routes - Notifications
  NOTIFICATIONS: {
    GET_MY: '/api/v1/notifications/my',
    GET_ALL: '/api/v1/notifications',
    GET_BY_ID: '/api/v1/notifications/:id',
    SEND: '/api/v1/notifications/send',
    MARK_READ: '/api/v1/notifications/:id/read',
    DELETE: '/api/v1/notifications/:id',
    CLEAR_ALL: '/api/v1/notifications/my/all',
  },

  // API Response Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    EVENT_REGISTRATION: 'EVENT_REGISTRATION',
    EVENT_CANCELLATION: 'EVENT_CANCELLATION',
    BOOKING_CONFIRMATION: 'BOOKING_CONFIRMATION',
    REMINDER: 'REMINDER',
    ANNOUNCEMENT: 'ANNOUNCEMENT',
  },

  // Error Messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Unauthorized - Token required',
    INVALID_TOKEN: 'Invalid or expired token',
    FORBIDDEN: 'Forbidden - Insufficient permissions',
    NOT_FOUND: 'Notification not found',
    SERVER_ERROR: 'Internal server error',
    MISSING_FIELDS: 'userId, type and message are required',
    IDENTITY_UNAVAILABLE: 'Identity Service unavailable. Please try again later.',
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    NOTIFICATION_SENT: 'Notification sent successfully',
    NOTIFICATION_DELETED: 'Notification deleted',
    MARKED_AS_READ: 'Marked as read',
    CLEARED: 'All notifications cleared',
  },
};

/**
 * Response Format Contract (matches Identity Service format)
 * All services must follow this response structure
 */
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
