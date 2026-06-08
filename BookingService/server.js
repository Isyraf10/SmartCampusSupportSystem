require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const mongoose   = require('mongoose');
const path       = require('path');

const facilityRoutes = require('./routes/facilityRoutes');
const bookingRoutes  = require('./routes/bookingRoutes');

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parser ────────────────────────────────────────────────────────────
app.use(express.json());

// ── Request Logger ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ── Static Frontend Files ─────────────────────────────────────────────────
// Serves index.html, app.js, style.css from /public
app.use(express.static(path.join(__dirname, 'public')));

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Campus Facility Booking Service',
        port: process.env.PORT || 5002,
        timestamp: new Date().toISOString(),
    });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/v1/facilities', facilityRoutes);
app.use('/api/v1/bookings',   bookingRoutes);

// ── MongoDB Connection ─────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campus_booking';

mongoose.connect(MONGO_URI)
    .then(() => console.log(`[MongoDB] Connected to ${MONGO_URI}`))
    .catch(err => {
        console.error('[MongoDB] Connection failed:', err.message);
        process.exit(1);
    });

// ── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(55));
    console.log(`✓ Booking Service running on port ${PORT}`);
    console.log(`✓ Identity Service: ${process.env.IDENTITY_SERVICE_URL || 'http://localhost:5000'}`);
    console.log(`✓ Notification Service: ${process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5003'}`);
    console.log(`✓ Frontend: http://localhost:${PORT}`);
    console.log('='.repeat(55) + '\n');
});
