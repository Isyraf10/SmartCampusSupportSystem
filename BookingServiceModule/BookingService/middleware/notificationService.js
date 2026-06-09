/**
 * notificationService.js
 *
 * Fires a POST to the Notification Service after every booking
 * creation or cancellation.
 *
 * SOA Best Practice: wrapped in try-catch — if the Notification Service
 * is offline, the booking still succeeds. We just log the error.
 */

const axios = require('axios');

const NOTIFICATION_URL =
    (process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5003') +
    '/api/v1/notifications';

async function sendAlert(userId, message) {
    try {
        await axios.post(
            NOTIFICATION_URL,
            { userId, message },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 3000,
            }
        );
        console.log(`[Notification] Alert sent for user: ${userId}`);
    } catch (err) {
        // Do NOT propagate — notification failure must not break the booking
        console.error(`[Notification] Could not reach Notification Service: ${err.message}`);
    }
}

module.exports = { sendAlert };
