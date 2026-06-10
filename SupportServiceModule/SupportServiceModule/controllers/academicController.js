const academicService = require('../services/academicService');

//1. View Academic Profile & CGPA
exports.getProfile = (req, res) => {
    academicService.getStudentProfile(req.user.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Academic profile not found." });
        res.json(result[0]);
    });
};

//2. View Class Schedule
exports.getSchedule = (req, res) => {
    academicService.getStudentSchedule(req.user.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Class schedule not found." });
        res.json(result);
    });
};