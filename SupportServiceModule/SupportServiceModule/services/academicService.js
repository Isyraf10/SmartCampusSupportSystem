const AcademicModel = require('../models/academicModel');

exports.getStudentProfile = (studentId, callback) => {
    AcademicModel.findProfileByStudentId(studentId, callback);
};

exports.getStudentSchedule = (studentId, callback) => {
    AcademicModel.findScheduleByStudentId(studentId, callback);
};