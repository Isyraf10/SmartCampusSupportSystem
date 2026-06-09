/**
 * User Routes for Identity Service
 * API Contract: /api/v1/users/*
 */

const express = require('express');
const userController = require('../controllers/userController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');
const { API_CONTRACTS } = require('../constants/apiConstants');

const router = express.Router();

/**
 * Protected Routes (requires authentication)
 */

// Get User Profile (current user)
// GET /api/v1/users/profile/me
router.get('/profile/me', verifyToken, userController.getProfile);

// Change Password
// POST /api/v1/users/change-password
// Body: { oldPassword, newPassword, confirmPassword }
router.post('/change-password', verifyToken, userController.changePassword);

// Update User Profile (current user or admin)
// PUT /api/v1/users/:id
router.put('/:id', verifyToken, userController.updateUser);

/**
 * Admin Only Routes
 */

// Get All Users
// GET /api/v1/users
router.get('/', 
    verifyToken,
    authorize([API_CONTRACTS.USER_ROLES.ADMIN]),
    userController.getAllUsers
);

// Get User by ID
// GET /api/v1/users/:id
router.get('/:id',
    verifyToken,
    authorize([API_CONTRACTS.USER_ROLES.ADMIN]),
    userController.getUserById
);

// Delete User
// DELETE /api/v1/users/:id
router.delete('/:id',
    verifyToken,
    authorize([API_CONTRACTS.USER_ROLES.ADMIN]),
    userController.deleteUser
);

module.exports = router;
