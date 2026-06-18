require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const notificationRoutes = require('./routes/notificationRoutes');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');
const { API_CONTRACTS } = require('./constants/apiConstants');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// FIXED: Changed from '/api/v1/health' to '/health' to prevent URL duplication through your Vite/Axios client setup
const healthResponse = (req, res) => {
    res.json({
        status: 'ok',
        service: API_CONTRACTS.SERVICE_NAME,
        port: process.env.PORT || 5003,
        timestamp: new Date().toISOString(),
    });
};

app.get('/api/v1/health', healthResponse);
app.get('/health', healthResponse);

app.use('/api/v1/notifications', notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5003;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log('\n============================================================');
            console.log('✓ Notification Service is running');
            console.log(`✓ Port: ${PORT}`);
            console.log('✓ Environment: development');
            console.log(`✓ Database: ${process.env.MONGO_URI || 'mongodb://localhost:27017/notification_db'}`);
            console.log('\nEndpoints:');
            console.log(`  - Health: http://localhost:${PORT}/health`);
            console.log(`  - Notifications: http://localhost:${PORT}/api/v1/notifications`);
            console.log('============================================================\n');
        });
    })
    .catch(err => {
        console.error('[MongoDB] Connection failed:', err.message);
        process.exit(1);
    });

module.exports = app;