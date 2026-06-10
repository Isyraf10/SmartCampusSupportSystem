const db = require('../config/db');

const AcademicModel = {
    findProfileByStudentId: (studentId, callback) => {
        return db.query("SELECT * FROM academic_profiles WHERE student_id = ?", [studentId], callback);
    },
    findScheduleByStudentId: (studentId, callback) => {
        return db.query("SELECT * FROM class_schedules WHERE student_id = ?", [studentId], callback);
    },
    createAppointment: (studentId, advisorName, date, callback) => {
        return db.query("INSERT INTO advisor_appointments (student_id, advisor_name, appointment_date) VALUES (?, ?, ?)", [studentId, advisorName, date], callback);
    },
    deleteAppointment: (appointmentId, studentId, callback) => {
        return db.query("DELETE FROM advisor_appointments WHERE id = ? AND student_id = ?", [appointmentId, studentId], callback);
    }
};

module.exports = AcademicModel;