/**
 * JWT Utility Functions
 * SOA Principle: Centralized token generation and validation
 */

global.crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { API_CONTRACTS } = require('../constants/apiConstants');

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET must be configured');
    }
    return process.env.JWT_SECRET;
};

const getJwtRefreshSecret = () => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET must be configured');
    }
    return process.env.JWT_REFRESH_SECRET;
};

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
        },
        getJwtSecret(),
        { expiresIn: API_CONTRACTS.TOKEN.ACCESS_TOKEN_EXPIRY }
    );
};

/**
 * Generate Refresh Token (long-lived)
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
        },
        getJwtRefreshSecret(),
        { expiresIn: API_CONTRACTS.TOKEN.REFRESH_TOKEN_EXPIRY }
    );
};

/**
 * Generate both tokens (Access + Refresh)
 */
const generateTokens = (user) => {
    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user),
    };
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error(API_CONTRACTS.ERROR_MESSAGES.INVALID_TOKEN);
    }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error('Refresh token expired');
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken,
};
