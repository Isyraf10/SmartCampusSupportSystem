/**
 * User Model for Identity Service
 * SOA Principle: Service-specific data model with isolation
 * Database: Independent MongoDB collection for Identity Service
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false // Don't include password in queries by default
    },
    matricNumber: {
        type: String,
        required: false,
        unique: true,
        sparse: true // Allow multiple null values
    },
    role: {
        type: String,
        enum: ['student', 'staff', 'admin'],
        default: 'student'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, { 
    timestamps: true,
    collection: 'users' // Explicit collection name for Identity Service
});

/**
 * Instance Methods
 */

// Format user response without sensitive data
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

/**
 * Static Methods
 */

// Find user by email (for login)
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// Find active users only
userSchema.statics.findActive = function(query = {}) {
    return this.find({ ...query, isActive: true });
};

/**
 * Indexes for Performance
 */
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);