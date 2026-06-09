/**
 * Authentication Middleware for Identity Service
 * SOA Principle: Centralized auth validation for API contracts
 */

const jwt = require('jsonwebtoken');
const { AppError, catchAsync } = require('../utils/errorHandler');
const { API_CONTRACTS } = require('../constants/apiConstants');


const verifyToken = catchAsync(async (req, res, next) => {
    let token;

    // Get token from headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new AppError(API_CONTRACTS.ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        throw new AppError(API_CONTRACTS.ERROR_MESSAGES.INVALID_TOKEN, 401);
    }
});

/**
 * Check User Role/Permission
 * Usage: authorize(['admin', 'staff'])
 */
const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.UNAUTHORIZED, 401);
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.FORBIDDEN, 403);
        }

        next();
    };
};

/**
 * Optional Token Verification (doesn't fail if no token)
 */
const optionalAuth = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            // Token is invalid but not required, continue
        }
    }

    next();
};

module.exports = {
    verifyToken,
    authorize,
    optionalAuth,
};
