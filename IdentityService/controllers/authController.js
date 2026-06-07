/**
 * Authentication Controller for Identity Service
 * Handles auth-related requests (register, login, token refresh)
 */

const fs = require('fs');
const path = require('path');
const UserService = require('../services/userService');
const { catchAsync } = require('../utils/errorHandler');
const { RESPONSE_CONTRACT, API_CONTRACTS } = require('../constants/apiConstants');
const { verifyRefreshToken, generateAccessToken } = require('../utils/jwtUtils');
const User = require('../models/User');

const logAuthController = (message, data) => {
    const logPath = path.join(__dirname, '..', 'tmp-auth-debug.log');
    const entry = `${new Date().toISOString()} ${message} ${JSON.stringify(data)}\n`;
    fs.appendFileSync(logPath, entry);
};

/**
 * Register User
 * POST /api/v1/auth/register
 */
exports.register = catchAsync(async (req, res) => {
    logAuthController('register start', { body: { ...req.body, password: '***', confirmPassword: '***' } });

    const result = await UserService.registerUser(req.body);

    logAuthController('register success', { userId: result.user.id });

    res.status(201).json(
        RESPONSE_CONTRACT.CREATED(
            {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            },
            API_CONTRACTS.SUCCESS_MESSAGES.USER_CREATED
        )
    );
});

/**
 * Login User
 * POST /api/v1/auth/login
 */
exports.login = catchAsync(async (req, res) => {
    // Validate request body exists and has required fields
    if (!req.body) {
        const { AppError } = require('../utils/errorHandler');
        throw new AppError('Request body is required', 400);
    }
    
    const { email, password } = req.body;
    
    if (!email || !password) {
        const { AppError } = require('../utils/errorHandler');
        throw new AppError(API_CONTRACTS.ERROR_MESSAGES.INVALID_CREDENTIALS, 400);
    }
    
    const result = await UserService.loginUser(email, password);

    res.status(200).json(
        RESPONSE_CONTRACT.SUCCESS(
            {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            },
            API_CONTRACTS.SUCCESS_MESSAGES.LOGIN_SUCCESS
        )
    );
});

/**
 * Logout User
 * POST /api/v1/auth/logout
 * Note: Logout endpoint doesn't require request body
 */
exports.logout = catchAsync(async (req, res) => {
    // In a real implementation, you might blacklist the token here
    // or invalidate the refresh token in a database
    
    // This endpoint doesn't require any authentication or request body
    // Simply return success response

    res.status(200).json(
        RESPONSE_CONTRACT.SUCCESS(
            null,
            API_CONTRACTS.SUCCESS_MESSAGES.LOGOUT_SUCCESS
        )
    );
});

/**
 * Refresh Access Token
 * POST /api/v1/auth/refresh-token
 * Body: { refreshToken: "..." }
 */
exports.refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        const { AppError } = require('../utils/errorHandler');
        throw new AppError('Refresh token required', 400);
    }

    try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.id);

        if (!user) {
            const { AppError } = require('../utils/errorHandler');
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.USER_NOT_FOUND, 404);
        }

        const newAccessToken = generateAccessToken(user);

        res.status(200).json(
            RESPONSE_CONTRACT.SUCCESS(
                { accessToken: newAccessToken },
                API_CONTRACTS.SUCCESS_MESSAGES.TOKEN_REFRESHED
            )
        );
    } catch (error) {
        const { AppError } = require('../utils/errorHandler');
        throw new AppError('Invalid refresh token', 401);
    }
});

/**
 * Verify Token
 * POST /api/v1/auth/verify-token
 * Body: { token: "..." }
 */
exports.verifyToken = catchAsync(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        const { AppError } = require('../utils/errorHandler');
        throw new AppError('Token required', 400);
    }

    // The middleware already verified the token if we're here
    res.status(200).json(
        RESPONSE_CONTRACT.SUCCESS(
            { valid: true, user: req.user },
            'Token is valid'
        )
    );
});

module.exports = exports;
