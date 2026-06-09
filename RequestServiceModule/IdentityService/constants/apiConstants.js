/**
 * API Constants & Contracts for Identity Service
 * SOA Principle: API Contract defines service boundaries
 */

const API_CONTRACTS = {
    // Service identification
    SERVICE_NAME: 'Identity Service',
    SERVICE_PORT: process.env.IDENTITY_SERVICE_PORT || 5000,
    SERVICE_URL: 'http://localhost:5000',

    // API Routes - Authentication
    AUTH: {
        REGISTER: '/api/v1/auth/register',
        LOGIN: '/api/v1/auth/login',
        LOGOUT: '/api/v1/auth/logout',
        REFRESH_TOKEN: '/api/v1/auth/refresh-token',
        VERIFY_TOKEN: '/api/v1/auth/verify-token',
    },

    // API Routes - User Management
    USERS: {
        GET_ALL: '/api/v1/users',
        GET_BY_ID: '/api/v1/users/:id',
        UPDATE: '/api/v1/users/:id',
        DELETE: '/api/v1/users/:id',
        GET_PROFILE: '/api/v1/users/profile/me',
    },

    // API Response Status Codes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        INTERNAL_SERVER_ERROR: 500,
    },

    // User Roles (Authorization)
    USER_ROLES: {
        STUDENT: 'student',
        STAFF: 'staff',
        ADMIN: 'admin',
    },

    // Error Messages (Standardized for API)
    ERROR_MESSAGES: {
        INVALID_CREDENTIALS: 'Invalid email or password',
        USER_NOT_FOUND: 'User not found',
        USER_EXISTS: 'User already exists with this email',
        UNAUTHORIZED: 'Unauthorized - Token required',
        INVALID_TOKEN: 'Invalid or expired token',
        FORBIDDEN: 'Forbidden - Insufficient permissions',
        VALIDATION_ERROR: 'Validation error',
        SERVER_ERROR: 'Internal server error',
        PASSWORD_MISMATCH: 'Passwords do not match',
        INVALID_EMAIL: 'Invalid email format',
        WEAK_PASSWORD: 'Password must be at least 8 characters',
    },

    // Success Messages
    SUCCESS_MESSAGES: {
        USER_CREATED: 'User registered successfully',
        LOGIN_SUCCESS: 'Login successful',
        LOGOUT_SUCCESS: 'Logout successful',
        USER_UPDATED: 'User updated successfully',
        USER_DELETED: 'User deleted successfully',
        TOKEN_REFRESHED: 'Token refreshed successfully',
    },

    // Token Configuration
    TOKEN: {
        ACCESS_TOKEN_EXPIRY: '1h',
        REFRESH_TOKEN_EXPIRY: '7d',
    },

    // Validation Rules
    VALIDATION: {
        MIN_PASSWORD_LENGTH: 3,
        EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        MATRIC_NUMBER_PATTERN: /^[a-zA-Z]{1}\d{5}$/,
    },
};

/**
 * Response Format Contract (for loose coupling with other services)
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

module.exports = {
    API_CONTRACTS,
    RESPONSE_CONTRACT,
};
