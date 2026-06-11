const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
  getMyNotifications,
  getAllNotifications,
  getNotificationById,
  markAsRead,
  sendNotification,
  deleteNotification,
  clearMyNotifications,
} = require('../controllers/notificationController');

// Protected routes (requires valid token from Identity Service)
router.get('/my', verifyToken, getMyNotifications);
router.delete('/my/all', verifyToken, clearMyNotifications);
router.get('/:id', verifyToken, getNotificationById);
router.put('/:id/read', verifyToken, markAsRead);
router.delete('/:id', verifyToken, deleteNotification);

// Admin only routes
router.get('/', verifyToken, isAdmin, getAllNotifications);
router.post('/send', verifyToken, isAdmin, sendNotification);

module.exports = router;
