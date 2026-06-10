const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const academicRoutes = require('./routes/academicRoutes');

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

//sambungkan dgn API utama
app.use('/api/v1/academic', academicRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(55));
    console.log(`✓ Academic Support Service API running on port ${PORT}`);
    console.log(`✓ Connected to Identity Service at http://localhost:5000`);
    console.log('='.repeat(55) + '\n');
});