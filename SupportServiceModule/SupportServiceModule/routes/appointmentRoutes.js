const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

// Kita buang perkataan /appointments dekat depan sbb server.js sudah bawa prefix tu chokk!
router.post('/book-advisor', authenticateUser, appointmentController.bookAdvisor);
router.get('/appointments', authenticateUser, appointmentController.getAppointments);
router.delete('/appointments/:id', authenticateUser, appointmentController.cancelAppointment);

module.exports = router;