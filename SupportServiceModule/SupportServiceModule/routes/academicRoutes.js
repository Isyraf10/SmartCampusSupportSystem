const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');
const academicController = require('../controllers/academicController');

router.get('/profile', authenticateUser, academicController.getProfile);
router.get('/schedule', authenticateUser, academicController.getSchedule);

module.exports = router;