const Notification = require('../models/Notification');

// GET /api/v1/notifications/my (Protected)
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const notifs = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: notifs.length, data: notifs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// GET /api/v1/notifications (Admin)
const getAllNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, count: notifs.length, data: notifs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// GET /api/v1/notifications/:id (Protected)
const getNotificationById = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, data: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// PUT /api/v1/notifications/:id/read (Protected)
const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.' });
    const userId = req.user?.id || req.user?._id;
    if (notif.userId !== userId) return res.status(403).json({ success: false, message: 'Access denied.' });
    notif.isRead = true;
    await notif.save();
    res.json({ success: true, message: 'Marked as read.', data: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// POST /api/v1/notifications/send (Admin)
// Used to send notifications manually or triggered by other services
const sendNotification = async (req, res) => {
  try {
    const { userId, type, message, metadata } = req.body;
    if (!userId || !type || !message) {
      return res.status(400).json({ success: false, message: 'userId, type and message are required.' });
    }
    const notif = await Notification.create({ userId, type, message, metadata: metadata || {} });
    console.log(`[NOTIFICATION SERVICE] Notification sent to user ${userId}: ${message}`);
    res.status(201).json({ success: true, message: 'Notification sent successfully.', data: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// DELETE /api/v1/notifications/:id (Protected)
const deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findByIdAndDelete(req.params.id);
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// DELETE /api/v1/notifications/my/all (Protected) - clear all my notifications
const clearMyNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    await Notification.deleteMany({ userId });
    res.json({ success: true, message: 'All notifications cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

module.exports = {
  getMyNotifications,
  getAllNotifications,
  getNotificationById,
  markAsRead,
  sendNotification,
  deleteNotification,
  clearMyNotifications,
};
