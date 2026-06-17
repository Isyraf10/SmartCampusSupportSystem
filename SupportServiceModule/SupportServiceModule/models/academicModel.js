const mongoose = require('mongoose');

// 1. Kekalkan Mongoose Schemas Asal Group Korang
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

const AcademicProfile = mongoose.model('AcademicProfile', academicProfileSchema);
const ClassSchedule = mongoose.model('ClassSchedule', classScheduleSchema);
const AdvisorAppointment = mongoose.model('AdvisorAppointment', advisorAppointmentSchema);

// 2. Export Database Methods TULEN (Cari & Simpan Data Real dari User)
const AcademicModel = {
    
    // Ambil Profil berdasarkan studentId yang tengah login (Cari dari MongoDB)
    findProfileByStudentId: (studentId, callback) => {
        AcademicProfile.find({ student_id: studentId })
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    },
    
    // Ambil Jadual Kelas berdasarkan studentId yang tengah login (Cari dari MongoDB)
    findScheduleByStudentId: (studentId, callback) => {
        ClassSchedule.find({ student_id: studentId })
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    },

    // SIMPAN PROFIL BARU (Bila user pertama kali isi profile dorang sendiri)
    createProfile: (studentId, gpa, cgpa, semester, callback) => {
        const newProfile = new AcademicProfile({
            student_id: studentId,
            gpa: gpa,
            cgpa: cgpa,
            current_semester: semester
        });
        newProfile.save()
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    },

    // SIMPAN JADUAL KELAS BARU (Bila user masukkan subjek baharu lewat UI)
    createSchedule: (studentId, courseCode, courseName, day, timeSlot, classroom, callback) => {
        const newSchedule = new ClassSchedule({
            student_id: studentId,
            course_code: courseCode,
            course_name: courseName,
            day: day,
            time_slot: timeSlot,
            classroom: classroom
        });
        newSchedule.save()
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    },
    
    // Buat Appointment (Simpan ke MongoDB)
    createAppointment: (studentId, advisorName, date, callback) => {
        const newAppointment = new AdvisorAppointment({
            student_id: studentId,
            advisor_name: advisorName,
            appointment_date: new Date(date)
        });
        newAppointment.save()
            .then(result => callback(null, { insertId: result._id }))
            .catch(err => callback(err, null));
    },
    
    // Padam Appointment dari MongoDB
    deleteAppointment: (appointmentId, studentId, callback) => {
        AdvisorAppointment.deleteOne({ _id: appointmentId, student_id: studentId })
            .then(result => callback(null, { affectedRows: result.deletedCount }))
            .catch(err => callback(err, null));
    }
};

module.exports = AcademicModel;