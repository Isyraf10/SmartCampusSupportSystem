const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

router.post('/book-advisor', authenticateUser, appointmentController.bookAdvisor);
router.delete('/appointments/:id', authenticateUser, appointmentController.cancelAppointment);

module.exports = router;