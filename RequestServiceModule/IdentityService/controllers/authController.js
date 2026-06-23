/**
 * Authentication Controller for Identity Service
 * Handles auth-related requests (register, login, token refresh)
 */

const UserService = require('../services/userService');
const { catchAsync } = require('../utils/errorHandler');
const { RESPONSE_CONTRACT, API_CONTRACTS } = require('../constants/apiConstants');
const { verifyRefreshToken, generateAccessToken } = require('../utils/jwtUtils');
const User = require('../models/User');

/**
 * Register User
 * POST /api/v1/auth/register
 */
exports.register = catchAsync(async (req, res) => {
    const result = await UserService.registerUser(req.body);

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
 * Header: { Authorization: "Bearer ..." }
 */
exports.verifyToken = catchAsync(async (req, res) => {
    // FIX: read token from Authorization header, not body
    // because all services send it as Bearer token in header
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const { AppError } = require('../utils/errorHandler');
        throw new AppError('Token required', 400);
    }

    const token = authHeader.substring(7); // strip "Bearer "

    // req.user is already attached by authMiddleware (verifyToken middleware)
    // so we just need to confirm it's there
    if (!req.user) {
        const { AppError } = require('../utils/errorHandler');
        throw new AppError('Invalid token', 401);
    }

    res.status(200).json(
        RESPONSE_CONTRACT.SUCCESS(
            { valid: true, user: req.user },
            'Token is valid'
        )
    );
});

/**
 * Google OAuth Login/Registration
 * POST /api/v1/auth/google
 * Body: { token: "..." }
 */
exports.googleLogin = catchAsync(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        const { AppError } = require('../utils/errorHandler');
        throw new AppError('Google ID token is required', 400);
    }

    // Verify Google ID Token
    const { verifyGoogleToken } = require('../utils/googleAuth');
    const googleProfile = await verifyGoogleToken(token);

    const { email, name } = googleProfile;
    
    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;

    if (user) {
        // User exists, update lastLogin
        user.lastLogin = new Date();
        await user.save();
    } else {
        // New user - registration with auto-extracted matric number & role (Option A)
        isNewUser = true;
        const crypto = require('crypto');
        const { hashPassword } = require('../utils/passwordUtils');

        const emailLower = email.toLowerCase();
        const [prefix, domain] = emailLower.split('@');

        let matricNumber = null;
        let role = 'student';

        // UMT student matric number pattern: 1 letter followed by 5 digits (e.g. s75717)
        if (/^[a-z]\d{5}$/i.test(prefix)) {
            matricNumber = prefix.toUpperCase(); // Normalize to uppercase (e.g. S75717)
            role = 'student';
        } else {
            // Check if staff email (e.g. umt.edu.my or contains staff)
            if (domain === 'umt.edu.my' || domain.includes('staff')) {
                role = 'staff';
            } else {
                role = 'student'; // Default role
            }
        }

        // Generate high entropy random password since it is required in the schema
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await hashPassword(randomPassword);

        // Create new user
        user = new User({
            name,
            email: emailLower,
            password: hashedPassword,
            matricNumber,
            role,
            lastLogin: new Date(),
        });

        await user.save();
    }

    // Generate tokens
    const { generateTokens } = require('../utils/jwtUtils');
    const tokens = generateTokens(user);

    // Format response
    const formattedUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        matricNumber: user.matricNumber || null,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };

    res.status(isNewUser ? 201 : 200).json(
        RESPONSE_CONTRACT.SUCCESS(
            {
                user: formattedUser,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
            isNewUser ? API_CONTRACTS.SUCCESS_MESSAGES.USER_CREATED : API_CONTRACTS.SUCCESS_MESSAGES.LOGIN_SUCCESS
        )
    );
});

module.exports = exports;
