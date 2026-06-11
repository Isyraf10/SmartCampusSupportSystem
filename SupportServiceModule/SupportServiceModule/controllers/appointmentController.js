const academicService = require('../services/appointmentService');

//1. Book Advisor Appointment
exports.bookAdvisor = (req, res) => {
    const { advisor_name, date } = req.body;
    const token = req.headers['authorization']; // <-- Grab the token from Postman
    
    // Pass the token as the 4th argument
    academicService.bookNewAppointment(req.user.id, advisor_name, date, token, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Advisor appointment booking submitted successfully!", appointmentId: result.insertId });
    });
};



//2. Cancel Advisor Appointment
exports.cancelAppointment = (req, res) => {
    const appointmentId = req.params.id;
    academicService.removeAppointment(appointmentId, req.user.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Appointment not found." });
        res.json({ message: "Advisor appointment cancelled successfully!" });
    });
};