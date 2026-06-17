require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const facilityRoutes = require('./routes/facility.routes');
const bookingRoutes = require('./routes/booking.routes');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Campus Facility Booking Service',
        port: process.env.PORT || 5002,
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/v1/facilities', facilityRoutes);
app.use('/api/v1/bookings', bookingRoutes);

const PORT = process.env.PORT || 5002;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(55));
            console.log(`✓ Booking Service API running on port ${PORT}`);
            console.log(`✓ Identity Service: ${process.env.IDENTITY_SERVICE_URL || 'http://localhost:5000'}`);
            console.log(`✓ Notification Service: ${process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5003'}`);
            console.log('='.repeat(55) + '\n');
        });
    })
    .catch(err => {
        console.error('[MongoDB] Connection failed:', err.message);
        process.exit(1);
    });

module.exports = app;