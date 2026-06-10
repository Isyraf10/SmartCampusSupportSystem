const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const authenticateUser = require('../middleware/authMiddleware');

// Sangkutkan middleware auth dan controller dekat jalan raya API
router.get('/profile', authenticateUser, academicController.getProfile);
router.get('/schedule', authenticateUser, academicController.getSchedule);
router.post('/book-advisor', authenticateUser, academicController.bookAdvisor);
router.delete('/appointments/:id', authenticateUser, academicController.cancelAppointment);

module.exports = router;