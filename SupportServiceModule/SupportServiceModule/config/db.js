const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Automatically uses the Docker container name 'mongo' if set in your .env
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/academic_support_db';
        const conn = await mongoose.connect(uri);
        console.log(`✓ Successfully connected to MongoDB at ${conn.connection.host}!`);
    } catch (err) {
        console.error('✗ Failed to connect to MongoDB:', err.message);
        process.exit(1);
    }
};

connectDB();

module.exports = mongoose;