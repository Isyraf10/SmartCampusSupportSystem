const academicService = require('../services/academicService');

exports.getProfile = (req, res) => {
    academicService.getStudentProfile(req.user.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Academic profile not found." });
        res.json(result[0]);
    });
};

exports.getSchedule = (req, res) => {
    academicService.getStudentSchedule(req.user.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Class schedule not found." });
        res.json(result);
    });
};

exports.bookAdvisor = (req, res) => {
    const { advisor_name, date } = req.body;
    academicService.bookNewAppointment(req.user.id, advisor_name, date, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Advisor appointment booking submitted successfully!", appointmentId: result.insertId });
    });
};

exports.cancelAppointment = (req, res) => {
    const appointmentId = req.params.id;
    academicService.removeAppointment(appointmentId, req.user.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Appointment not found." });
        res.json({ message: "Advisor appointment cancelled successfully!" });
    });
};