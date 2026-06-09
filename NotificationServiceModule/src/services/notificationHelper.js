const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');

/**
 * Simulates sending a notification (RabbitMQ/email in production)
 * For prototype: stores notification in memory and logs to console
 */
const sendNotification = (userId, type, message, metadata = {}) => {
  const notification = {
    id: `notif-${uuidv4()}`,
    userId,
    type,       // e.g. 'EVENT_REGISTRATION', 'BOOKING_CONFIRMATION', 'REMINDER'
    message,
    metadata,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  db.notifications.push(notification);

  // Simulate RabbitMQ publish
  console.log(`[NOTIFICATION SERVICE] Sending notification to user ${userId}:`);
  console.log(`  Type   : ${type}`);
  console.log(`  Message: ${message}`);

  return notification;
};

module.exports = { sendNotification };
