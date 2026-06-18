const axios = require('axios');

const IDENTITY_VERIFY_URL =
    (process.env.IDENTITY_SERVICE_URL || 'http://localhost:5000') +
    '/api/v1/auth/verify-token';

function isPublicRoute(path, method) {
    if (path.startsWith('/api/v1/health')) return true;
    return false;
}

async function authMiddleware(req, res, next) {
    const { path, method } = req;
    if (isPublicRoute(path, method)) return next();

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.substring(7);
    try {
        const response = await axios.post(IDENTITY_VERIFY_URL, {}, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
        });

        const body = response.data;
        if (!body || !body.data || !body.data.user) {
            return res.status(401).json({ message: 'Unexpected Identity Service response format' });
        }

        const { id, email, role, name } = body.data.user;
        if (!id) return res.status(401).json({ message: 'User ID missing in token payload' });

        req.user = { userId: id, userRole: role || 'student', userEmail: email || '', userName: name || '' };
        console.log(`[Auth] Verified: userId=${id} role=${role}`);
        return next();

    } catch (err) {
        if (err.response) return res.status(401).json({ message: 'Invalid or expired token' });
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
            return res.status(503).json({ message: 'Identity Service is unreachable' });
        }
        return res.status(401).json({ message: 'Authentication error' });
    }
}

function isAdmin(req, res, next) {
    if (!req.user || req.user.userRole !== 'admin') {
        return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }
    next();
}

module.exports = { authMiddleware, isAdmin };
