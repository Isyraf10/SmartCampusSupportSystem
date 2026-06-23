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
    status: { type: String, default: 'Pending' },
    created_at: { type: Date, default: Date.now }
});

const AcademicProfile = mongoose.model('AcademicProfile', academicProfileSchema, 'academic_profiles');
const ClassSchedule = mongoose.model('ClassSchedule', classScheduleSchema, 'class_schedules');
const AdvisorAppointment = mongoose.model('AdvisorAppointment', advisorAppointmentSchema, 'advisor_appointments');

// 2. Export Database Methods TULEN (Cari & Simpan Data Real dari User)
const AcademicModel = {
    
    // Ambil Profil berdasarkan studentId yang tengah login (Cari dari MongoDB)
    findProfileByStudentId: (studentId, callback) => {
        const studentIdUpper = studentId ? String(studentId).toUpperCase() : '';
        AcademicProfile.find({ student_id: studentIdUpper })
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    },
    
    // Ambil Jadual Kelas berdasarkan studentId yang tengah login (Cari dari MongoDB)
    findScheduleByStudentId: (studentId, callback) => {
        const studentIdUpper = studentId ? String(studentId).toUpperCase() : '';
        ClassSchedule.find({ student_id: studentIdUpper })
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    },

    // SIMPAN PROFIL BARU (Bila user pertama kali isi profile dorang sendiri)
    createProfile: (studentId, gpa, cgpa, semester, callback) => {
        const studentIdUpper = studentId ? String(studentId).toUpperCase() : '';
        const newProfile = new AcademicProfile({
            student_id: studentIdUpper,
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
        const studentIdUpper = studentId ? String(studentId).toUpperCase() : '';
        const newSchedule = new ClassSchedule({
            student_id: studentIdUpper,
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
        const studentIdUpper = studentId ? String(studentId).toUpperCase() : '';
        const newAppointment = new AdvisorAppointment({
            student_id: studentIdUpper,
            advisor_name: advisorName,
            appointment_date: new Date(date)
        });
        newAppointment.save()
            .then(result => callback(null, { insertId: result._id }))
            .catch(err => callback(err, null));
    },
    
    // Padam Appointment dari MongoDB
    deleteAppointment: (appointmentId, studentId, callback) => {
        const studentIdUpper = studentId ? String(studentId).toUpperCase() : '';
        AdvisorAppointment.deleteOne({ _id: appointmentId, student_id: studentIdUpper })
            .then(result => callback(null, { affectedRows: result.deletedCount }))
            .catch(err => callback(err, null));
    },

    // Ambil Appointments berdasarkan studentId yang tengah login
    findAppointmentsByStudentId: (studentId, callback) => {
        const studentIdUpper = studentId ? String(studentId).toUpperCase() : '';
        AdvisorAppointment.find({ student_id: studentIdUpper })
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    },

    // Ambil detail Appointment tertentu untuk dihantar notifikasi pembatalan
    findAppointmentById: (appointmentId, studentId, callback) => {
        const studentIdUpper = studentId ? String(studentId).toUpperCase() : '';
        AdvisorAppointment.findOne({ _id: appointmentId, student_id: studentIdUpper })
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    }
};

module.exports = AcademicModel;