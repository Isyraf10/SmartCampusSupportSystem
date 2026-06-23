/**
 * Authentication Routes for Identity Service
 * API Contract: /api/v1/auth/*
 */

const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Public Routes
 */

// Register User
// POST /api/v1/auth/register
// Body: { name, email, password, confirmPassword, matricNumber (optional), role (optional) }
router.post('/register', authController.register);

// Login User
// POST /api/v1/auth/login
// Body: { email, password }
router.post('/login', authController.login);

// Google Login User
// POST /api/v1/auth/google
// Body: { token }
router.post('/google', authController.googleLogin);

// Logout User
// POST /api/v1/auth/logout
router.post('/logout', authController.logout);

// Refresh Token
// POST /api/v1/auth/refresh-token
// Body: { refreshToken }
router.post('/refresh-token', authController.refreshToken);

/**
 * Protected Routes
 */

// Verify Token
// POST /api/v1/auth/verify-token
router.post('/verify-token', verifyToken, authController.verifyToken);

module.exports = router;
