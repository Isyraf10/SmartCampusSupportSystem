const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const academicRoutes = require('./routes/academicRoutes');
const { errorHandler } = require('./utils/errorHandler');

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

// Routes utama
app.use('/api/v1/academic', academicRoutes);

// Pasang Global Error Handler dari folder utils
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log(`✓ Academic Support Service API running on port ${PORT}`);
    console.log(`✓ Full MVC + Architecture Pattern Aligned with BookingService`);
    console.log('='.repeat(60) + '\n');
});