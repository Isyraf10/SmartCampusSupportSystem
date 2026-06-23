/**
 * Google Authentication Utilities
 * Verification of Google ID Tokens
 */

const { OAuth2Client } = require('google-auth-library');

// Fallback to the client ID provided by the user if environment variable is not defined
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '435171560938-kns6n1r4c56dk74gju1dr5cv9a3t5jvf.apps.googleusercontent.com';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Verify Google ID Token
 * @param {string} token - The ID token from the frontend Google sign-in
 * @returns {Promise<object>} The user profile payload
 */
const verifyGoogleToken = async (token) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        // Ensure email exists in the payload
        if (!payload || !payload.email) {
            throw new Error('Google token payload is missing email address');
        }

        return {
            email: payload.email,
            name: payload.name || 'Google User',
            picture: payload.picture,
            email_verified: payload.email_verified,
        };
    } catch (error) {
        console.error('Error verifying Google ID token:', error.message);
        throw new Error('Invalid Google token');
    }
};

module.exports = {
    verifyGoogleToken,
};
