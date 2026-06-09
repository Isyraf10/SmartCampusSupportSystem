const express = require('express');
const axios = require('axios');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

//Sambungan ke Local Database MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin', //password mysql laptop
    database: 'academic_support_db'
});

db.connect((err) => {
    if (err) {
        console.error('Failed to connect to local database:', err.message);
    } else {
        console.log('Successfully connected to Local MySQL Database!');
    }
});

//middleware (Verify Token)
const authenticateUser = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: "Authorization token is required!" });
    }
    
    try {
        //panggil another service di port 5000 untuk verify token
        const response = await axios.get('http://localhost:5000/api/v1/users/profile/me', {
            headers: { Authorization: token }
        });
        
        req.user = { id: response.data.data.id || response.data.data._id }; 
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token or the Identity Service is not running!" });
    }
};

//endpoint 1: View Academic Profile & CGPA (GET)
app.get('/api/v1/academic/profile', authenticateUser, (req, res) => {
    const query = "SELECT * FROM academic_profiles WHERE student_id = ?";
    db.query(query, [req.user.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Academic profile not found." });
        res.json(result[0]);
    });
});

//endpoint 2: View Class Schedule (GET)
app.get('/api/v1/academic/schedule', authenticateUser, (req, res) => {
    const query = "SELECT * FROM class_schedules WHERE student_id = ?";
    db.query(query, [req.user.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Class schedule not found for this student." });
        res.json(result); // Memulangkan senarai array jadual kelas
    });
});

//endpoint 3: Book Advisor Appointment (POST)
app.post('/api/v1/academic/book-advisor', authenticateUser, (req, res) => {
    const { advisor_name, date } = req.body;
    const query = "INSERT INTO advisor_appointments (student_id, advisor_name, appointment_date) VALUES (?, ?, ?)";
    db.query(query, [req.user.id, advisor_name, date], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Advisor appointment booking submitted successfully!", appointmentId: result.insertId });
    });
});

//endpoint 4: Cancel Advisor Appointment (DELETE)
app.delete('/api/v1/academic/appointments/:id', authenticateUser, (req, res) => {
    const appointmentId = req.params.id;
    //pelajar hanya boleh padam janji temu milik diri sendiri sahaja
    const query = "DELETE FROM advisor_appointments WHERE id = ? AND student_id = ?";
    
    db.query(query, [appointmentId, req.user.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Appointment not found or you are not authorized to delete it." });
        }
        res.json({ message: "Advisor appointment cancelled successfully!" });
    });
});

//turn on server Academic Service di port 5002
app.listen(5002, () => {
    console.log("Academic Support Service is now running on port 5002");
});