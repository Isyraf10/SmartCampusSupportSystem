const Notification = require('../models/Notification');
const { catchAsync, AppError } = require('../utils/errorHandler');
const { RESPONSE_CONTRACT, API_CONTRACTS } = require('../constants/apiConstants');

// GET /api/v1/notifications/my (Protected)
const getMyNotifications = catchAsync(async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  const notifs = await Notification.find({ userId }).sort({ createdAt: -1 });
  res.json(RESPONSE_CONTRACT.SUCCESS(notifs, `Found ${notifs.length} notifications`));
});

// GET /api/v1/notifications (Admin)
const getAllNotifications = catchAsync(async (req, res) => {
  const notifs = await Notification.find().sort({ createdAt: -1 });
  res.json(RESPONSE_CONTRACT.SUCCESS(notifs, `Found ${notifs.length} notifications`));
});

// GET /api/v1/notifications/:id (Protected)
const getNotificationById = catchAsync(async (req, res, next) => {
  const notif = await Notification.findById(req.params.id);
  if (!notif) return next(new AppError(API_CONTRACTS.ERROR_MESSAGES.NOT_FOUND, 404));
  res.json(RESPONSE_CONTRACT.SUCCESS(notif));
});

// PUT /api/v1/notifications/:id/read (Protected)
const markAsRead = catchAsync(async (req, res, next) => {
  const notif = await Notification.findById(req.params.id);
  if (!notif) return next(new AppError(API_CONTRACTS.ERROR_MESSAGES.NOT_FOUND, 404));

  const userId = req.user?.id || req.user?._id;
  if (notif.userId !== userId) return next(new AppError(API_CONTRACTS.ERROR_MESSAGES.FORBIDDEN, 403));

  notif.isRead = true;
  await notif.save();
  res.json(RESPONSE_CONTRACT.SUCCESS(notif, API_CONTRACTS.SUCCESS_MESSAGES.MARKED_AS_READ));
});

// POST /api/v1/notifications/send (Admin)
const sendNotification = catchAsync(async (req, res, next) => {
  const { userId, type, message, metadata } = req.body;
  if (!userId || !type || !message) {
    return next(new AppError(API_CONTRACTS.ERROR_MESSAGES.MISSING_FIELDS, 400));
  }

  const notif = await Notification.create({ userId, type, message, metadata: metadata || {} });
  console.log(`[NOTIFICATION SERVICE] → User: ${userId} | Type: ${type} | Message: ${message}`);
  res.status(201).json(RESPONSE_CONTRACT.CREATED(notif, API_CONTRACTS.SUCCESS_MESSAGES.NOTIFICATION_SENT));
});

// DELETE /api/v1/notifications/:id (Protected)
const deleteNotification = catchAsync(async (req, res, next) => {
  const notif = await Notification.findByIdAndDelete(req.params.id);
  if (!notif) return next(new AppError(API_CONTRACTS.ERROR_MESSAGES.NOT_FOUND, 404));
  res.json(RESPONSE_CONTRACT.SUCCESS(null, API_CONTRACTS.SUCCESS_MESSAGES.NOTIFICATION_DELETED));
});

// DELETE /api/v1/notifications/my/all (Protected)
const clearMyNotifications = catchAsync(async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  await Notification.deleteMany({ userId });
  res.json(RESPONSE_CONTRACT.SUCCESS(null, API_CONTRACTS.SUCCESS_MESSAGES.CLEARED));
});

module.exports = {
  getMyNotifications,
  getAllNotifications,
  getNotificationById,
  markAsRead,
  sendNotification,
  deleteNotification,
  clearMyNotifications,
};
