/**
 * authMiddleware.js — SOA Token Verification (Option A: Remote)
 *
 * Calls the Identity Service POST /api/v1/auth/verify-token
 * to verify every incoming Bearer token before the request
 * reaches any route handler.
 *
 * On success  → attaches userId, userRole, userEmail to req
 * On failure  → returns 401 Unauthorized immediately
 * If Identity Service is offline → returns 503 Service Unavailable
 *
 * Public routes (health, GET facilities, static files) are whitelisted
 * and skip this middleware entirely.
 */

const axios = require('axios');

const IDENTITY_VERIFY_URL =
    (process.env.IDENTITY_SERVICE_URL || 'http://localhost:5000') +
    '/api/v1/auth/verify-token';

// Routes that do NOT require a token
function isPublicRoute(path, method) {
    if (path.startsWith('/api/v1/health')) return true;
    if (path.startsWith('/api/v1/facilities') && method === 'GET') return true;
    return false;
}

async function authMiddleware(req, res, next) {
    const { path, method } = req;

    // Whitelist — let public routes through without a token
    if (isPublicRoute(path, method)) {
        return next();
    }

    // Extract Bearer token
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Missing or malformed Authorization header. Expected: Bearer <token>',
        });
    }

    const token = authHeader.substring(7); // strip "Bearer "

    // Call Identity Service to verify
    try {
        const response = await axios.post(
            IDENTITY_VERIFY_URL,
            {},   // empty body — token is in the header
            {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000, // 5 second timeout
            }
        );

        // Identity Service response shape:
        // { success: true, data: { valid: true, user: { id, email, role, name } } }
        const body = response.data;

        if (!body || !body.data || !body.data.user) {
            return res.status(401).json({ message: 'Unexpected Identity Service response format' });
        }

        const { id, email, role, name } = body.data.user;

        if (!id) {
            return res.status(401).json({ message: 'User ID missing in token payload' });
        }

        // Attach verified user info to the request object
        // Route handlers read from req.user — never from raw headers
        req.user = {
            userId:    id,
            userRole:  role  || 'student',
            userEmail: email || '',
            userName:  name  || '',
        };

        console.log(`[Auth] Verified: userId=${id} role=${role}`);
        return next();

    } catch (err) {
        // Identity Service returned 4xx (token expired, invalid)
        if (err.response) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Identity Service is offline / unreachable
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
            console.error('[Auth] Identity Service unreachable:', err.message);
            return res.status(503).json({
                message: 'Identity Service is unreachable. Please try again later.',
            });
        }

        // Unexpected error
        console.error('[Auth] Unexpected error:', err.message);
        return res.status(401).json({ message: 'Authentication error' });
    }
}

module.exports = authMiddleware;
