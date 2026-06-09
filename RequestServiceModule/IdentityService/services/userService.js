// Business Logic for Identity Service
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');
const { hashPassword, comparePassword, validateEmail, validateMatricNumber } = require('../utils/passwordUtils');
const { generateTokens } = require('../utils/jwtUtils');
const { API_CONTRACTS } = require('../constants/apiConstants');

class UserService {
    // Register New User
     
    static async registerUser(userData) {
        const { name, email, password, confirmPassword, matricNumber, role } = userData;

        // Validate inputs
        if (!name || !email || !password) {
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.VALIDATION_ERROR, 400);
        }

        if (password !== confirmPassword) {
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.PASSWORD_MISMATCH, 400);
        }

        if (!validateEmail(email)) {
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.INVALID_EMAIL, 400);
        }

        if (matricNumber && !validateMatricNumber(matricNumber)) {
            throw new AppError('Invalid matric number format. Expected format: S12345', 400);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.USER_EXISTS, 409);
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            matricNumber,
            role: role || API_CONTRACTS.USER_ROLES.STUDENT,
        });

        await user.save();

        // Generate tokens
        const tokens = generateTokens(user);

        // Return user without password
        return {
            user: this.formatUserResponse(user),
            ...tokens,
        };
    }

    // Login User
    static async loginUser(email, password) {
        if (!email || !password) {
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.INVALID_CREDENTIALS, 400);
        }

        // Find user and explicitly select password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
        }

        // Generate tokens
        const tokens = generateTokens(user);

        return {
            user: this.formatUserResponse(user),
            ...tokens,
        };
    }

    static async getUserProfile(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.USER_NOT_FOUND, 404);
        }

        return this.formatUserResponse(user);
    }

    static async getAllUsers(query = {}) {
        const users = await User.find(query).select('-password');
        return users;
    }


    static async updateUser(userId, updateData) {
        const { name, matricNumber, role } = updateData;

        // Validate inputs
        if (matricNumber && !validateMatricNumber(matricNumber)) {
            throw new AppError('Invalid matric number format. Expected format: S12345', 400);
        }

        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (matricNumber !== undefined) updateFields.matricNumber = matricNumber;
        if (role !== undefined) updateFields.role = role;

        if (Object.keys(updateFields).length === 0) {
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.VALIDATION_ERROR, 400);
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true, runValidators: true }
        );

        if (!user) {
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.USER_NOT_FOUND, 404);
        }

        return this.formatUserResponse(user);
    }

    // Delete User
    static async deleteUser(userId) {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.USER_NOT_FOUND, 404);
        }

        return { message: API_CONTRACTS.SUCCESS_MESSAGES.USER_DELETED };
    }


    static async changePassword(userId, oldPassword, newPassword, confirmPassword) {
        if (newPassword !== confirmPassword) {
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.PASSWORD_MISMATCH, 400);
        }

        if (newPassword === oldPassword) {
            throw new AppError('New password must be different from old password', 400);
        }

        // Explicitly select password field since it has select: false in schema
        const user = await User.findById(userId).select('+password');
        if (!user) {
            throw new AppError(API_CONTRACTS.ERROR_MESSAGES.USER_NOT_FOUND, 404);
        }

        const isPasswordValid = await comparePassword(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new AppError('Current password is incorrect', 401);
        }

        user.password = await hashPassword(newPassword);
        await user.save();

        return { message: 'Password changed successfully' };
    }

    // Format user response (without sensitive data)
    static formatUserResponse(user) {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            matricNumber: user.matricNumber || null,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}

module.exports = UserService;
