const mongoose = require('mongoose');

const connectDB = async () => {
    const maxRetries = 5;
    let retries = 0;

    const connect = async () => {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log(`✓ MongoDB connected: ${conn.connection.host}`);
            console.log(`✓ Database: ${conn.connection.db.databaseName}`);
            return true;
        } catch (error) {
            retries++;
            console.error(`✗ MongoDB Connection Error (Attempt ${retries}/${maxRetries}):`);
            console.error(`  Message: ${error.message}`);
            console.error(`  URI: ${process.env.MONGO_URI}`);
            
            if (retries < maxRetries) {
                console.log(`  Retrying in 3 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                return connect();
            }
            
            console.error(`✗ Failed to connect after ${maxRetries} attempts`);
            console.error(`\nDEBUG INFO:`);
            console.error(`- Make sure MongoDB is running`);
            console.error(`- Check MONGO_URI in .env file`);
            console.error(`- Verify MongoDB port (default: 27017)`);
            process.exit(1);
        }
    };

    await connect();
};

module.exports = connectDB;