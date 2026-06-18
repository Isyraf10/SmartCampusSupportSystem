const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
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
router.get('/my',       authMiddleware, getMyNotifications);
router.delete('/my/all', authMiddleware, clearMyNotifications);
router.get('/:id',      authMiddleware, getNotificationById);
router.put('/:id/read', authMiddleware, markAsRead);
router.delete('/:id',   authMiddleware, deleteNotification);

// Admin only routes
router.get('/',  authMiddleware, isAdmin, getAllNotifications);
router.post('/', authMiddleware, sendNotification);

module.exports = router;
