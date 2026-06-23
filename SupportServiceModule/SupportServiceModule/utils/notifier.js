const axios = require('axios');

const NOTIF_URL = process.env.NOTIFICATION_SERVICE_URL
    ? `${process.env.NOTIFICATION_SERVICE_URL}/api/v1/notifications`
    : 'http://localhost:5004/api/v1/notifications';

const sendSystemNotification = async (recipientId, type, message, metadata, token) => {
    try {
        console.log('[Notifier] Sending notification to', recipientId);
        
        const payload = {
            targetAudience: 'INDIVIDUAL',
            recipientId: recipientId,
            type: type,
            message: message,
            metadata: metadata
        };

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        const response = await axios.post(NOTIF_URL, payload, config);
        console.log('[Notifier] Success! The notification was sent.');
    } catch (error) {
        console.error('[Notifier] Failed.');
        console.error('[Notifier] Error:', error.message);
        if (error.response) {
            console.error('[Notifier] Server Details:', error.response.data);
        }
    }
};

module.exports = { sendSystemNotification };