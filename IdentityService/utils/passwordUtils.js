/**
 * Password Utility Functions
 * SOA Principle: Centralized password security
 */

const bcrypt = require('bcryptjs');
const { API_CONTRACTS } = require('../constants/apiConstants');

/**
 * Hash Password
 */
const hashPassword = async (password) => {
    // Validate password strength
    if (password.length < API_CONTRACTS.VALIDATION.MIN_PASSWORD_LENGTH) {
        throw new Error(API_CONTRACTS.ERROR_MESSAGES.WEAK_PASSWORD);
    }

    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

/**
 * Compare Password with Hash
 */
const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

/**
 * Validate Email Format
 */
const validateEmail = (email) => {
    return API_CONTRACTS.VALIDATION.EMAIL_PATTERN.test(email);
};

/**
 * Validate Matric Number Format (if needed)
 */
const validateMatricNumber = (matricNumber) => {
    if (!matricNumber) return true; // Optional field
    return API_CONTRACTS.VALIDATION.MATRIC_NUMBER_PATTERN.test(matricNumber);
};

module.exports = {
    hashPassword,
    comparePassword,
    validateEmail,
    validateMatricNumber,
};
