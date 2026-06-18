const mongoose = require('mongoose');

async function connectDB() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/notification_db';

    await mongoose.connect(MONGO_URI);
    console.log(`[MongoDB] Connected to ${MONGO_URI}`);
}

module.exports = { connectDB };
