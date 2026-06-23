const academicService = require('../services/academicService');
const AcademicModel = require('../models/academicModel');
const { sendSystemNotification } = require('../utils/notifier');

exports.bookAdvisor = (req, res) => {
    const { advisor_name, date } = req.body;
    const token = req.headers['authorization']; 
    
    academicService.bookNewAppointment(req.user.id, advisor_name, date, token, async (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const userEmail = req.user.email || req.user.id;
        const pureToken = token ? token.split(' ')[1] || token : '';
        const appointmentDateStr = new Date(date).toLocaleDateString('en-US', { dateStyle: 'medium' });

        await sendSystemNotification(
            userEmail,
            'ANNOUNCEMENT',
            `Your appointment request with advisor ${advisor_name} on ${appointmentDateStr} is submitted.`,
            { appointmentId: result.insertId },
            pureToken
        );

        res.json({ message: "Advisor appointment booking submitted successfully!", appointmentId: result.insertId });
    });
};

exports.cancelAppointment = (req, res) => {
    const appointmentId = req.params.id;
    const token = req.headers['authorization'];
    const pureToken = token ? token.split(' ')[1] || token : '';

    // First retrieve details for dynamic notification message
    AcademicModel.findAppointmentById(appointmentId, req.user.id, (err, appointment) => {
        if (err || !appointment) {
            return res.status(404).json({ message: "Appointment not found." });
        }

        academicService.removeAppointment(appointmentId, req.user.id, async (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: "Appointment not found." });

            const userEmail = req.user.email || req.user.id;
            const appointmentDateStr = new Date(appointment.appointment_date).toLocaleDateString('en-US', { dateStyle: 'medium' });

            await sendSystemNotification(
                userEmail,
                'ANNOUNCEMENT',
                `Your appointment request with advisor ${appointment.advisor_name} on ${appointmentDateStr} has been successfully cancelled.`,
                { appointmentId: appointmentId },
                pureToken
            );

            res.json({ message: "Advisor appointment cancelled successfully!" });
        });
    });
};

exports.getAppointments = (req, res) => {
    academicService.getStudentAppointments(req.user.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};