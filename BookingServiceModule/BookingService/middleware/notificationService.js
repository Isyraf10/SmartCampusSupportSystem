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

async function sendAlert(userId, message, token) {
    if (!token) {
        console.error('[Notification] No token provided, skipping alert');
        return; 
    }
    try {
        console.log(`[Notification] Attempting to send alert to user: ${userId}`);
        console.log('DEBUG: Notification URL is:', process.env.NOTIFICATION_SERVICE_URL);
        
    await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/v1/notifications`, 
        { userId, type: 'BOOKING_CONFIRMATION', message }, 
            { 
        headers: { 
            'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
        } 
    }
);
        
        console.log(`[Notification] Alert sent successfully for user: ${userId}`);
        
    } catch (error) {
        // Log the error, but do NOT stop the booking from finishing
        console.error('[Notification] Could not reach Notification Service:', error.response?.data || error.message);
    }
}

module.exports = { sendAlert };