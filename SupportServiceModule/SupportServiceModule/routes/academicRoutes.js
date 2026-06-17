const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');
const academicController = require('../controllers/academicController');

// Tambah laluan POST dekat routes/academicRoutes.js
router.get('/profile', authenticateUser, academicController.getProfile);
router.get('/schedule', authenticateUser, academicController.getSchedule);

// JALAN RAYA BARU UNTUK USER HANTAR DATA MASUK DATABASE:
router.post('/profile', authenticateUser, academicController.addProfile);
router.post('/schedule', authenticateUser, academicController.addSchedule);

module.exports = router;