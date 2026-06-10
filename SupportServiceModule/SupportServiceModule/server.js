const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const { errorHandler } = require('./utils/time');
const academicRoutes = require('./routes/academicRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

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

app.use('/api/v1/academic', academicRoutes);
app.use('/api/v1/appointments', appointmentRoutes); 

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log(`✓ Academic Support Service API running on port ${PORT}`);
    console.log(`✓ 100% Split Architecture Pattern Matched with BookingService!`);
    console.log('='.repeat(60) + '\n');
});