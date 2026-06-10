/**
 * Centralized Error Handler for Notification Service
 * SOA Principle: Standardized error handling for API contracts
 */

const { RESPONSE_CONTRACT } = require('../constants/apiConstants');

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
    return res.status(400).json(RESPONSE_CONTRACT.ERROR(400, 'Validation error', errors));
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(RESPONSE_CONTRACT.ERROR(401, 'Invalid or expired token'));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(RESPONSE_CONTRACT.ERROR(401, 'Token expired'));
  }

  console.error('Unhandled Error:', err);
  res.status(err.status).json(RESPONSE_CONTRACT.ERROR(err.status, err.message));
};

/**
 * Not Found Error Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

module.exports = { AppError, catchAsync, errorHandler, notFoundHandler };
