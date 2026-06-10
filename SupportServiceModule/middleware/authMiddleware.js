const axios = require('axios');

const authenticateUser = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: "Authorization token is required!" });
    }
    
    try {
        // Panggil Identity Service Isyraf di port 5000 untuk check token
        const response = await axios.get('http://localhost:5000/api/v1/users/profile/me', {
            headers: { Authorization: token }
        });
        
        req.user = { id: response.data.data.id || response.data.data._id }; 
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token or the Identity Service is not running!" });
    }
};

module.exports = authenticateUser;