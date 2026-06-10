const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin', 
    database: 'academic_support_db'
});

db.connect((err) => {
    if (err) {
        console.error('Failed to connect to local database:', err.message);
    } else {
        console.log('Successfully connected to Local MySQL Database!');
    }
});

module.exports = db;