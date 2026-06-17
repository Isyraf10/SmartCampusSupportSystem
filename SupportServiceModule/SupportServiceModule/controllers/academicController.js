const academicService = require('../services/academicService');

// 1. View Academic Profile & CGPA
exports.getProfile = (req, res) => {
    academicService.getStudentProfile(req.user.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Academic profile not found." });
        res.json(result[0]);
    });
};

// 2. View Class Schedule
exports.getSchedule = (req, res) => {
    academicService.getStudentSchedule(req.user.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Class schedule not found." });
        res.json(result);
    });
}; // <-- Tadi dekat sini terpotong chokk, sekarang sudah ada penutup ngam!

// 3. Fungsi untuk User Kasi Masuk Data Profil Sendiri (POST)
exports.addProfile = (req, res) => {
    const { gpa, cgpa, current_semester } = req.body;
    academicService.createStudentProfile(req.user.id, gpa, cgpa, current_semester, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Academic profile saved to database successfully!", data: result });
    });
};

// 4. Fungsi untuk User Kasi Masuk Jadual Kelas Baru Sendiri (POST)
exports.addSchedule = (req, res) => {
    const { course_code, course_name, day, time_slot, classroom } = req.body;
    academicService.createStudentSchedule(req.user.id, course_code, course_name, day, time_slot, classroom, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "New course saved to database successfully!", data: result });
    });
};