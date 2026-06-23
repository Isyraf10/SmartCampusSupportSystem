const axios = require('axios');

const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization token is required!" });
    }
    
    try {
        const identityBaseUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:5000';
        const response = await axios.get(`${identityBaseUrl}/api/v1/users/profile/me`, {
            headers: { Authorization: authHeader }
        });
        
        const userData = response.data.data;
        if (!userData) throw new Error('Empty user data from identity service');

        // Normalize matricNumber to uppercase to match academic_profiles collection
        const matricNormalized = userData.matricNumber
            ? String(userData.matricNumber).toUpperCase()
            : null;
        
        req.user = {
            id: matricNormalized || String(userData.id || userData._id),
            email: userData.email,
            name: userData.name,
            role: userData.role,
            matricNumber: matricNormalized
        };

        console.log(`[Auth] Authenticated user: ${req.user.email}, studentId: ${req.user.id}`);
        next();
    } catch (error) {
        console.error('[AuthMiddleware] Token validation failed:', error.message);
        res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports = authenticateUser;