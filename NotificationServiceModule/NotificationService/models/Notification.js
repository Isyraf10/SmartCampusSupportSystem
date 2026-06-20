const mongoose = require('mongoose');

console.log("=========================================");
console.log("LOADING NEW SCHEMA: LECTURER IS ENABLED");
console.log("=========================================");

const notificationSchema = new mongoose.Schema({
  userId: { type: String, default: null },
  userEmail: { type: String, default: null },

  targetAudience: {
    type: String,
    required: true,
    enum: ['ALL', 'STUDENT', 'STAFF', 'STUDENT_STAFF', 'LECTURER', 'LECTURER_STUDENT', 'ADMIN', 'INDIVIDUAL'],
    default: 'INDIVIDUAL'
  },
  type: {
    type: String,
    required: true,
    enum: ['REMINDER', 'BOOKING_CONFIRMATION', 'EVENT_REGISTRATION', 'EVENT_CANCELLATION', 'ANNOUNCEMENT']
  },
  message: { type: String, required: true },
  metadata: { type: Object, default: {} },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);