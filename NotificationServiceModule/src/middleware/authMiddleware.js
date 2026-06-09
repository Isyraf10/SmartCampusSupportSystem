const axios = require('axios');

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:5000';

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Call Identity Service to verify token
    const response = await axios.post(
      `${IDENTITY_SERVICE_URL}/api/v1/auth/verify-token`,
      { Authorization: `Bearer ${token}` }
    );

    // Attach user info from Identity Service to request
    req.user = response.data.user || response.data;
    next();
  } catch (error) {
    if (error.response) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
        error: error.response.data,
      });
    }
    return res.status(503).json({
      success: false,
      message: 'Identity Service unavailable. Please try again later.',
    });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admins only.',
    });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
