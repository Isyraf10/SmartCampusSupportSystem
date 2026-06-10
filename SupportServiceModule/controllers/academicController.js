const db = require('../config/db');

// 1. View Academic Profile & CGPA
exports.getProfile = (req, res) => {
    const query = "SELECT * FROM academic_profiles WHERE student_id = ?";
    db.query(query, [req.user.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Academic profile not found." });
        res.json(result[0]);
    });
};

// 2. View Class Schedule
exports.getSchedule = (req, res) => {
    const query = "SELECT * FROM class_schedules WHERE student_id = ?";
    db.query(query, [req.user.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Class schedule not found for this student." });
        res.json(result);
    });
};

// 3. Book Advisor Appointment
exports.bookAdvisor = (req, res) => {
    const { advisor_name, date } = req.body;
    const query = "INSERT INTO advisor_appointments (student_id, advisor_name, appointment_date) VALUES (?, ?, ?)";
    db.query(query, [req.user.id, advisor_name, date], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Advisor appointment booking submitted successfully!", appointmentId: result.insertId });
    });
};

// 4. Cancel Advisor Appointment
exports.cancelAppointment = (req, res) => {
    const appointmentId = req.params.id;
    const query = "DELETE FROM advisor_appointments WHERE id = ? AND student_id = ?";
    
    db.query(query, [appointmentId, req.user.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Appointment not found or you are not authorized." });
        }
        res.json({ message: "Advisor appointment cancelled successfully!" });
    });
};