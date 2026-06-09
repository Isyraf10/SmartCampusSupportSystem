/**
 * Centralized Error Handler for Identity Service
 * SOA Principle: Standardized error handling for API contracts
 */

const { RESPONSE_CONTRACT, API_CONTRACTS } = require('../constants/apiConstants');

class AppError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.status = status;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Async error wrapper to catch errors in route handlers
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    err.status = err.status || 500;
    err.message = err.message || 'Internal Server Error';

    // Validation Error (Mongoose)
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json(
            RESPONSE_CONTRACT.ERROR(400, API_CONTRACTS.ERROR_MESSAGES.VALIDATION_ERROR, errors)
        );
    }

    // Duplicate Key Error (Mongoose)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json(
            RESPONSE_CONTRACT.ERROR(
                409,
                `${field} already exists`,
                { field }
            )
        );
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json(
            RESPONSE_CONTRACT.ERROR(401, API_CONTRACTS.ERROR_MESSAGES.INVALID_TOKEN)
        );
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json(
            RESPONSE_CONTRACT.ERROR(401, 'Token expired')
        );
    }

    // Log unexpected errors for debugging
    console.error('Unhandled Error:', err);

    // Custom AppError
    res.status(err.status).json(
        RESPONSE_CONTRACT.ERROR(err.status, err.message)
    );
};

/**
 * Not Found Error Handler
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(
        `Route ${req.originalUrl} not found`,
        404
    );
    next(error);
};

module.exports = {
    AppError,
    catchAsync,
    errorHandler,
    notFoundHandler,
};
