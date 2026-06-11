const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Validate required env vars
const requiredEnvVars = ['MONGODB_URI', 'IDENTITY_SERVICE_URL'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
if (missingEnvVars.length) {
  console.error(`✗ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const connectDB = require('./config/db');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');
const { API_CONTRACTS } = require('./constants/apiConstants');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

connectDB();

// CORS Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'UP',
    service: API_CONTRACTS.SERVICE_NAME,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Welcome
app.get('/', (req, res) => {
  res.json({
    message: `Welcome to ${API_CONTRACTS.SERVICE_NAME}`,
    version: '1.0.0',
    endpoints: {
      notifications: API_CONTRACTS.NOTIFICATIONS,
      health: '/api/v1/health',
    },
  });
});

// Routes
app.use('/api/v1/notifications', notificationRoutes);

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✓ ${API_CONTRACTS.SERVICE_NAME} is running`);
  console.log(`✓ Port: ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Database: ${process.env.MONGODB_URI}`);
  console.log(`✓ Identity Service: ${process.env.IDENTITY_SERVICE_URL}`);
  console.log(`\nEndpoints:`);
  console.log(`  - Health: http://localhost:${PORT}/api/v1/health`);
  console.log(`  - Notifications: http://localhost:${PORT}/api/v1/notifications`);
  console.log(`${'='.repeat(60)}\n`);
});
