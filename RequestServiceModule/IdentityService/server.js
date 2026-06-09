const express = require('express');
const cors = require('cors');
require('dotenv').config();

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
if (missingEnvVars.length) {
    console.error(`✗ Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

// Import utilities
const connectDB = require('./config/db');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');
const { API_CONTRACTS } = require('./constants/apiConstants');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize Express Application
const app = express();

connectDB();

// CORS Middleware - Allow other services to communicate
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// REQUEST LOGGING MIDDLEWARE
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// HEALTH CHECK & INFO ENDPOINTS
// Service Info Endpoint (for service discovery)
app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'UP',
        service: API_CONTRACTS.SERVICE_NAME,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Welcome Endpoint
app.get('/', (req, res) => {
    res.json({
        message: `Welcome to ${API_CONTRACTS.SERVICE_NAME}`,
        version: '1.0.0',
        endpoints: {
            auth: API_CONTRACTS.AUTH,
            users: API_CONTRACTS.USERS,
            health: '/api/v1/health',
        },
    });
});

// API ROUTES

// Authentication Routes
// Handles: Register, Login, Logout, Token Refresh, Token Verification
app.use('/api/v1/auth', authRoutes);

// User Management Routes
// Handles: Profile, User List, Update, Delete, Change Password
app.use('/api/v1/users', userRoutes);

// Not Found Handler (must be after all routes)
app.use(notFoundHandler);

// Global Error Handler (must be last)
app.use(errorHandler);

// server startup
const PORT = process.env.PORT || process.env.IDENTITY_SERVICE_PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✓ ${API_CONTRACTS.SERVICE_NAME} is running`);
    console.log(`✓ Port: ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ Database: ${process.env.MONGO_URI || 'Not configured'}`);
    console.log(`\nEndpoints:`);
    console.log(`  - Health: http://localhost:${PORT}/api/v1/health`);
    console.log(`  - Auth: http://localhost:${PORT}/api/v1/auth`);
    console.log(`  - Users: http://localhost:${PORT}/api/v1/users`);
    console.log(`${'='.repeat(60)}\n`);
});
