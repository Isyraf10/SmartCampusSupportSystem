const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');

// PANGGIL KEDUA-DUA CONTROLLER YANG KITA ASINGKAN TADI BAA CHOKK
const academicController = require('../controllers/academicController');
const appointmentController = require('../controllers/appointmentController');

// 1. Endpoint Laluan Akademik (Profile & Jadual)
router.get('/profile', authenticateUser, academicController.getProfile);
router.get('/schedule', authenticateUser, academicController.getSchedule);

// 2. Endpoint Laluan Booking Appointment
router.post('/book-advisor', authenticateUser, appointmentController.bookAdvisor);
router.delete('/appointments/:id', authenticateUser, appointmentController.cancelAppointment);

module.exports = router;