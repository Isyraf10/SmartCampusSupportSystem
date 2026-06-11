const mongoose = require('mongoose');
const { API_CONTRACTS } = require('../constants/apiConstants');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: Object.values(API_CONTRACTS.NOTIFICATION_TYPES),
  },
  message: { type: String, required: true },
  metadata: { type: Object, default: {} },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
