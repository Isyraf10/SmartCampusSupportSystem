/**
 * Service Discovery & API Contract Documentation
 * Identity Service - Smart Campus System
 * 
 * This file documents the API contract that other services
 * can use to communicate with the Identity Service
 */

/**
 * SERVICE INFORMATION
 */
const SERVICE_INFO = {
    name: 'Identity Service',
    version: '1.0.0',
    description: 'User authentication and authorization service',
    port: 5000,
    baseURL: 'http://localhost:5000/api/v1',
    database: 'MongoDB (smart-campus-identity)',
};

const AUTH_API = {
    /**
     * Register New User
     * POST /api/v1/auth/register
     * 
     * Request Body:
     * {
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "password": "securePassword123",
     *   "confirmPassword": "securePassword123",
     *   "matricNumber": "AD123456" (optional),
     *   "role": "student" (optional, default: "student")
     * }
     * 
     * Response (201 Created):
     * {
     *   "success": true,
     *   "status": 201,
     *   "message": "User registered successfully",
     *   "data": {
     *     "user": {
     *       "id": "....",
     *       "name": "John Doe",
     *       "email": "john@example.com",
     *       "role": "student",
     *       "createdAt": "2024-06-01T..."
     *     },
     *     "accessToken": "eyJhbGciOiJIUzI1NiIs...",
     *     "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
     *   }
     * }
     */
    REGISTER: 'POST /api/v1/auth/register',

    /**
     * Login User
     * POST /api/v1/auth/login
     * 
     * Request Body:
     * {
     *   "email": "john@example.com",
     *   "password": "securePassword123"
     * }
     * 
     * Response (200 OK):
     * {
     *   "success": true,
     *   "status": 200,
     *   "message": "Login successful",
     *   "data": {
     *     "user": { ... },
     *     "accessToken": "...",
     *     "refreshToken": "..."
     *   }
     * }
     */
    LOGIN: 'POST /api/v1/auth/login',

    /**
     * Logout User
     * POST /api/v1/auth/logout
     * 
     * No request body required
     * 
     * Response (200 OK):
     * {
     *   "success": true,
     *   "message": "Logout successful"
     * }
     */
    LOGOUT: 'POST /api/v1/auth/logout',

    /**
     * Refresh Access Token
     * POST /api/v1/auth/refresh-token
     * 
     * Request Body:
     * {
     *   "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
     * }
     * 
     * Response (200 OK):
     * {
     *   "success": true,
     *   "message": "Token refreshed successfully",
     *   "data": {
     *     "accessToken": "eyJhbGciOiJIUzI1NiIs..."
     *   }
     * }
     */
    REFRESH_TOKEN: 'POST /api/v1/auth/refresh-token',

    /**
     * Verify Token (Requires authentication)
     * POST /api/v1/auth/verify-token
     * 
     * Headers:
     * {
     *   "Authorization": "Bearer <accessToken>"
     * }
     * 
     * Response (200 OK):
     * {
     *   "success": true,
     *   "message": "Token is valid",
     *   "data": {
     *     "valid": true,
     *     "user": {
     *       "id": "...",
     *       "email": "john@example.com",
     *       "role": "student"
     *     }
     *   }
     * }
     */
    VERIFY_TOKEN: 'POST /api/v1/auth/verify-token',
};


const USER_API = {
    /**
     * Get User Profile (Current User)
     * GET /api/v1/users/profile/me
     * 
     * Headers:
     * {
     *   "Authorization": "Bearer <accessToken>"
     * }
     * 
     * Response (200 OK):
     * {
     *   "success": true,
     *   "data": { user object },
     *   "message": "Profile retrieved successfully"
     * }
     */
    GET_PROFILE: 'GET /api/v1/users/profile/me',

    /**
     * Get All Users (Admin Only)
     * GET /api/v1/users?role=student
     * 
     * Headers:
     * {
     *   "Authorization": "Bearer <adminToken>"
     * }
     * 
     * Query Parameters:
     * - role: optional, filter by role (student, staff, admin)
     */
    GET_ALL_USERS: 'GET /api/v1/users',

    /**
     * Get User by ID (Admin Only)
     * GET /api/v1/users/:id
     * 
     * Headers:
     * {
     *   "Authorization": "Bearer <adminToken>"
     * }
     */
    GET_USER_BY_ID: 'GET /api/v1/users/:id',

    /**
     * Update User
     * PUT /api/v1/users/:id
     * 
     * Headers:
     * {
     *   "Authorization": "Bearer <token>"
     * }
     * 
     * Request Body:
     * {
     *   "name": "Updated Name",
     *   "matricNumber": "AD123457",
     *   "role": "staff" (admin only)
     * }
     */
    UPDATE_USER: 'PUT /api/v1/users/:id',

    /**
     * Delete User (Admin Only)
     * DELETE /api/v1/users/:id
     * 
     * Headers:
     * {
     *   "Authorization": "Bearer <adminToken>"
     * }
     */
    DELETE_USER: 'DELETE /api/v1/users/:id',

    /**
     * Change Password
     * POST /api/v1/users/change-password
     * 
     * Headers:
     * {
     *   "Authorization": "Bearer <token>"
     * }
     * 
     * Request Body:
     * {
     *   "oldPassword": "currentPassword123",
     *   "newPassword": "newPassword123",
     *   "confirmPassword": "newPassword123"
     * }
     */
    CHANGE_PASSWORD: 'POST /api/v1/users/change-password',
};

/**
 * RESPONSE STRUCTURE (All Endpoints)
 * ============================================
 * 
 * Success Response:
 * {
 *   "success": true,
 *   "status": 200,
 *   "message": "Operation successful",
 *   "data": { ... },
 *   "timestamp": "2024-06-01T12:00:00.000Z"
 * }
 * 
 * Error Response:
 * {
 *   "success": false,
 *   "status": 400,
 *   "message": "Error message",
 *   "errors": { ... } (optional),
 *   "timestamp": "2024-06-01T12:00:00.000Z"
 * }
 */

/**
 * AUTHENTICATION HEADERS
 * ============================================
 * 
 * For protected endpoints, include:
 * Authorization: Bearer <accessToken>
 * 
 * Example:
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

/**
 * USER ROLES & PERMISSIONS
 * ============================================
 * 
 * student: Limited to own profile
 * staff: Can access some resources
 * admin: Full access to all resources
 */

/**
 * ERROR HANDLING
 * ============================================
 * 
 * HTTP Status Codes:
 * - 200: OK
 * - 201: Created
 * - 400: Bad Request
 * - 401: Unauthorized
 * - 403: Forbidden
 * - 404: Not Found
 * - 409: Conflict (e.g., email already exists)
 * - 500: Internal Server Error
 */

/**
 * INTEGRATION EXAMPLE (For Other Services)
 * ============================================
 * 
 * const axios = require('axios');
 * const BASE_URL = 'http://localhost:5000/api/v1';
 * 
 * // Verify user token (from IT Service, Facility Service, etc.)
 * async function verifyUserToken(token) {
 *   try {
 *     const response = await axios.post(`${BASE_URL}/auth/verify-token`, {}, {
 *       headers: {
 *         'Authorization': `Bearer ${token}`
 *       }
 *     });
 *     return response.data;
 *   } catch (error) {
 *     throw new Error('Invalid token');
 *   }
 * }
 * 
 * // Get user details (requires admin token)
 * async function getUserDetails(userId, adminToken) {
 *   try {
 *     const response = await axios.get(`${BASE_URL}/users/${userId}`, {
 *       headers: {
 *         'Authorization': `Bearer ${adminToken}`
 *       }
 *     });
 *     return response.data.data;
 *   } catch (error) {
 *     throw new Error('User not found');
 *   }
 * }
 */

module.exports = {
    SERVICE_INFO,
    AUTH_API,
    USER_API,
};
