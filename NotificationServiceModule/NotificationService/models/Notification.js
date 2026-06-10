const mongoose = require('mongoose');
const { API_CONTRACTS } = require('../constants/apiConstants');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['REMINDER', 'BOOKING_CONFIRMATION', 'EVENT_REGISTRATION', 'EVENT_CANCELLATION', 'ANNOUNCEMENT'],
  },
  message: { type: String, required: true },
  metadata: { type: Object, default: {} },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
