const mongoose = require('mongoose');

// 1. Define Mongoose Schemas (Replaces your schema.sql)
const academicProfileSchema = new mongoose.Schema({
    student_id: { type: String, required: true, unique: true },
    gpa: { type: Number, required: true },
    cgpa: { type: Number, required: true },
    current_semester: { type: Number, required: true }
});

const classScheduleSchema = new mongoose.Schema({
    student_id: { type: String, required: true },
    course_code: { type: String, required: true },
    course_name: { type: String, required: true },
    day: { type: String, required: true },
    time_slot: { type: String, required: true },
    classroom: { type: String, required: true }
});

const advisorAppointmentSchema = new mongoose.Schema({
    student_id: { type: String, required: true },
    advisor_name: { type: String, required: true },
    appointment_date: { type: Date, required: true },
    created_at: { type: Date, default: Date.now }
});

// 2. Initialize Models
const AcademicProfile = mongoose.model('AcademicProfile', academicProfileSchema);
const ClassSchedule = mongoose.model('ClassSchedule', classScheduleSchema);
const AdvisorAppointment = mongoose.model('AdvisorAppointment', advisorAppointmentSchema);

// 3. Export Database Methods
const AcademicModel = {
    findProfileByStudentId: (studentId, callback) => {
        AcademicProfile.find({ student_id: studentId })
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    },
    
    findScheduleByStudentId: (studentId, callback) => {
        ClassSchedule.find({ student_id: studentId })
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    },
    
    createAppointment: (studentId, advisorName, date, callback) => {
        const newAppointment = new AdvisorAppointment({
            student_id: studentId,
            advisor_name: advisorName,
            appointment_date: new Date(date)
        });
        
        newAppointment.save()
            .then(result => {
                // Mimic MySQL's result.insertId so your controller doesn't break
                callback(null, { insertId: result._id }); 
            })
            .catch(err => callback(err, null));
    },
    
    deleteAppointment: (appointmentId, studentId, callback) => {
        AdvisorAppointment.deleteOne({ _id: appointmentId, student_id: studentId })
            .then(result => {
                // Mimic MySQL's result.affectedRows so your controller doesn't break
                callback(null, { affectedRows: result.deletedCount });
            })
            .catch(err => callback(err, null));
    }
};

module.exports = AcademicModel;