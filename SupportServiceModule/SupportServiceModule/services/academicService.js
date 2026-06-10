const AcademicModel = require('../models/academicModel');

exports.getStudentProfile = (studentId, callback) => {
    AcademicModel.findProfileByStudentId(studentId, callback);
};

exports.getStudentSchedule = (studentId, callback) => {
    AcademicModel.findScheduleByStudentId(studentId, callback);
};

exports.bookNewAppointment = (studentId, advisorName, date, callback) => {
    AcademicModel.createAppointment(studentId, advisorName, date, callback);
};

exports.removeAppointment = (appointmentId, studentId, callback) => {
    AcademicModel.deleteAppointment(appointmentId, studentId, callback);
};