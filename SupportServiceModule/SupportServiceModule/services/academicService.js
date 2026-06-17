const AcademicModel = require('../models/academicModel');

exports.getStudentProfile = (studentId, callback) => {
    AcademicModel.findProfileByStudentId(studentId, callback);
};

exports.getStudentSchedule = (studentId, callback) => {
    AcademicModel.findScheduleByStudentId(studentId, callback);
};

exports.createStudentProfile = (studentId, gpa, cgpa, semester, callback) => {
    AcademicModel.createProfile(studentId, gpa, cgpa, semester, callback);
};

exports.createStudentSchedule = (studentId, courseCode, courseName, day, timeSlot, classroom, callback) => {
    AcademicModel.createSchedule(studentId, courseCode, courseName, day, timeSlot, classroom, callback);
};