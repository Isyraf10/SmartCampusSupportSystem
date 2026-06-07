/**
 * User Controller for Identity Service
 * Handles user management requests (profile, update, delete)
 */

const UserService = require('../services/userService');
const { catchAsync } = require('../utils/errorHandler');
const { RESPONSE_CONTRACT, API_CONTRACTS } = require('../constants/apiConstants');

/**
 * Get User Profile
 * GET /api/v1/users/profile/me
 */
exports.getProfile = catchAsync(async (req, res) => {
    const user = await UserService.getUserProfile(req.user.id);

    res.status(200).json(
        RESPONSE_CONTRACT.SUCCESS(user, 'Profile retrieved successfully')
    );
});

/**
 * Get All Users (Admin Only)
 * GET /api/v1/users
 */
exports.getAllUsers = catchAsync(async (req, res) => {
    const { role } = req.query;
    const query = role ? { role } : {};

    const users = await UserService.getAllUsers(query);

    res.status(200).json(
        RESPONSE_CONTRACT.SUCCESS(
            { count: users.length, users },
            'Users retrieved successfully'
        )
    );
});

/**
 * Get User by ID (Admin Only)
 * GET /api/v1/users/:id
 */
exports.getUserById = catchAsync(async (req, res) => {
    const user = await UserService.getUserProfile(req.params.id);

    res.status(200).json(
        RESPONSE_CONTRACT.SUCCESS(user, 'User retrieved successfully')
    );
});

/**
 * Update User
 * PUT /api/v1/users/:id
 */
exports.updateUser = catchAsync(async (req, res) => {
    const user = await UserService.updateUser(req.params.id, req.body);

    res.status(200).json(
        RESPONSE_CONTRACT.SUCCESS(
            user,
            API_CONTRACTS.SUCCESS_MESSAGES.USER_UPDATED
        )
    );
});

/**
 * Delete User (Admin Only)
 * DELETE /api/v1/users/:id
 */
exports.deleteUser = catchAsync(async (req, res) => {
    const result = await UserService.deleteUser(req.params.id);

    res.status(200).json(
        RESPONSE_CONTRACT.SUCCESS(
            result,
            API_CONTRACTS.SUCCESS_MESSAGES.USER_DELETED
        )
    );
});

/**
 * Change Password
 * POST /api/v1/users/change-password
 */
exports.changePassword = catchAsync(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const result = await UserService.changePassword(
        req.user.id,
        oldPassword,
        newPassword,
        confirmPassword
    );

    res.status(200).json(
        RESPONSE_CONTRACT.SUCCESS(result, 'Password changed successfully')
    );
});

module.exports = exports;
