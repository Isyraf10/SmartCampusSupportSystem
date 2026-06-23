const academicService = require('../services/academicService');
const { sendSystemNotification } = require('../utils/notifier');

exports.bookAdvisor = (req, res) => {
    const { advisor_name, date } = req.body;
    const token = req.headers['authorization']; 
    
    academicService.bookNewAppointment(req.user.id, advisor_name, date, token, async (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const userEmail = req.user.email || req.user.id;
        const pureToken = token ? token.split(' ')[1] || token : '';

        await sendSystemNotification(
            userEmail,
            'ANNOUNCEMENT',
            'Your academic advisor appointment is submitted.',
            { appointmentId: result.insertId },
            pureToken
        );

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