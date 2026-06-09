/**
 * authMiddleware.js — identityService backend
 *
 * Used internally by the Identity Service itself to protect
 * its own admin/management routes.
 *
 * Other services (bookingService, notificationService, etc.)
 * do NOT use this file — they use their own authMiddleware.js
 * which calls the Identity Service remotely via HTTP.
 */

const jwt = require('jsonwebtoken');
const { AppError, catchAsync } = require('../utils/errorHandler');
const { API_CONTRACTS }        = require('../constants/apiConstants');

/**
 * verifyToken
 * Validates the Bearer JWT directly against JWT_SECRET.
 * Attaches the decoded payload to req.user.
 */
const verifyToken = catchAsync(async (req, res, next) => {
  let token;

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
 * authorize
 * Role-based access control. Call after verifyToken.
 *
 * Usage:
 *   router.delete('/users/:id', verifyToken, authorize(['admin']), deleteUser);
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
 * optionalAuth
 * Attaches req.user if a valid token is present, but does NOT
 * block the request if the token is missing or invalid.
 * Useful for routes that behave differently for guests vs logged-in users.
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
    } catch {
      // Invalid token — not required, so just continue without req.user
    }
  }

  next();
};

module.exports = { verifyToken, authorize, optionalAuth };
