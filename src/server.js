require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5004;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('========================================');
    console.log(`  Event & Notification Service`);
    console.log(`  Running on http://localhost:${PORT}`);
    console.log(`  Identity Service: ${process.env.IDENTITY_SERVICE_URL}`);
    console.log(`  Database: MongoDB Atlas`);
    console.log('========================================');
  });
});
