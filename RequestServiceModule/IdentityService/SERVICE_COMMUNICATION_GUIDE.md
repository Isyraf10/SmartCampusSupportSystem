/**
 * Service Communication Pattern
 * SOA Implementation: Smart Campus System
 * 
 * This demonstrates how different services communicate with each other
 * following the SOA principles of loose coupling and standardized contracts
 */

/**
 * SERVICE ARCHITECTURE
 * ============================================
 * 
 *                    API Gateway (Optional)
 *                          |
 *        __________________|__________________
 *        |                  |                  |
 *   Identity Service   IT Service        Facility Service
 *   (Port 5000)        (Port 5001)       (Port 5002)
 *        |                  |                  |
 *        └──────────────────┼──────────────────┘
 *                           |
 *              Notification Service (Port 5003)
 */

/**
 * COMMUNICATION FLOW
 * ============================================
 * 
 * Example: Student submits IT Request
 * 
 * 1. Client sends request to Identity Service
 *    POST /api/v1/auth/login → Get accessToken
 * 
 * 2. Client sends request to IT Service with token
 *    POST /api/v1/requests/create
 *    Headers: { Authorization: Bearer <accessToken> }
 * 
 * 3. IT Service verifies token with Identity Service
 *    POST http://localhost:5000/api/v1/auth/verify-token
 *    ↓
 *    Response: { user: { id, email, role } }
 * 
 * 4. IT Service creates request in its own database
 *    (Never uses Identity Service database)
 * 
 * 5. IT Service calls Notification Service
 *    POST http://localhost:5003/api/v1/notifications/send
 *    Body: { userId, message, type }
 * 
 * 6. Response returns to client with standardized format
 */

/**
 * CODE EXAMPLES FOR OTHER SERVICES
 * ============================================
 */

/**
 * Example 1: IT Service Integration
 * File: IT_Service/middleware/tokenVerification.js
 */
const itServiceTokenVerification = `
const axios = require('axios');
const IDENTITY_SERVICE_URL = 'http://localhost:5000/api/v1';

// Middleware to verify token from Identity Service
const verifyTokenFromIdentity = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            status: 401,
            message: 'Authorization token required'
        });
    }

    try {
        // Call Identity Service to verify token
        const response = await axios.post(
            \`\${IDENTITY_SERVICE_URL}/auth/verify-token\`,
            {},
            {
                headers: { Authorization: \`Bearer \${token}\` }
            }
        );

        // Store user info from Identity Service
        req.user = response.data.data.user;
        req.token = token;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            status: 401,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = { verifyTokenFromIdentity };
`;

/**
 * Example 2: Facility Service - Getting User Details
 * File: Facility_Service/services/facilityService.js
 */
const facilityServiceGetUser = `
const axios = require('axios');
const IDENTITY_SERVICE_URL = 'http://localhost:5000/api/v1';

class FacilityService {
    // Get user details from Identity Service
    static async getUserFromIdentity(userId, adminToken) {
        try {
            const response = await axios.get(
                \`\${IDENTITY_SERVICE_URL}/users/\${userId}\`,
                {
                    headers: {
                        Authorization: \`Bearer \${adminToken}\`
                    }
                }
            );
            
            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            return response.data.data; // User object
        } catch (error) {
            throw new Error('Failed to get user from Identity Service');
        }
    }

    // Allocate facility to user
    static async allocateFacility(userId, facilityData, adminToken) {
        // First verify user exists in Identity Service
        const user = await this.getUserFromIdentity(userId, adminToken);

        // Create facility allocation in Facility Service database
        const allocation = {
            userId: user.id,
            userName: user.name,
            email: user.email,
            facility: facilityData.name,
            allocatedAt: new Date()
        };

        // Save to Facility Service database (NOT Identity Service DB)
        // await FacilityAllocation.create(allocation);

        return allocation;
    }
}

module.exports = FacilityService;
`;

/**
 * Example 3: Notification Service - Notifying User
 * File: Notification_Service/services/notificationService.js
 */
const notificationServiceExample = `
const axios = require('axios');
const IDENTITY_SERVICE_URL = 'http://localhost:5000/api/v1';

class NotificationService {
    // Get user email from Identity Service
    static async getUserEmail(userId, adminToken) {
        try {
            const response = await axios.get(
                \`\${IDENTITY_SERVICE_URL}/users/\${userId}\`,
                {
                    headers: { Authorization: \`Bearer \${adminToken}\` }
                }
            );

            return response.data.data.email;
        } catch (error) {
            throw new Error('User not found');
        }
    }

    // Send notification to user
    static async sendNotification(userId, message, adminToken) {
        // Get user email from Identity Service
        const userEmail = await this.getUserEmail(userId, adminToken);

        // Create notification record in Notification Service database
        const notification = {
            userId,
            userEmail,
            message,
            sentAt: new Date(),
            status: 'sent'
        };

        // Save to Notification Service database
        // await Notification.create(notification);

        // Actually send email/notification
        // await emailService.send(userEmail, message);

        return notification;
    }
}

module.exports = NotificationService;
`;

/**
 * Example 4: Standardized Response Contract
 * All services must follow this format
 */
const standardResponseContract = `
{
  // Success Response
  "success": true,
  "status": 200,
  "message": "Operation successful",
  "data": {
    // Service-specific data
  },
  "timestamp": "2024-06-01T12:00:00Z"
}

{
  // Error Response
  "success": false,
  "status": 400,
  "message": "Error description",
  "errors": {
    "field": "error details"
  },
  "timestamp": "2024-06-01T12:00:00Z"
}
`;

/**
 * DATABASE ISOLATION
 * ============================================
 * 
 * ✓ Identity Service Database
 *   └── smart-campus-identity
 *       └── users collection
 * 
 * ✓ IT Service Database
 *   └── smart-campus-it
 *       ├── requests collection
 *       └── tickets collection
 * 
 * ✓ Facility Service Database
 *   └── smart-campus-facility
 *       ├── facilities collection
 *       ├── allocations collection
 *       └── bookings collection
 * 
 * ✓ Notification Service Database
 *   └── smart-campus-notification
 *       └── notifications collection
 * 
 * RULE: Services NEVER access each other's databases directly!
 * Always use REST API calls instead.
 */

/**
 * SECURITY PRACTICES
 * ============================================
 * 
 * 1. Token Verification
 *    - Always verify tokens by calling Identity Service
 *    - Don't trust tokens received from other services
 *    - Implement token expiry handling
 * 
 * 2. Admin Tokens
 *    - Services that need to fetch user data should use admin token
 *    - Store admin token securely in environment variables
 *    - Rotate tokens regularly
 * 
 * 3. API Validation
 *    - Validate all incoming data
 *    - Check response status codes
 *    - Handle timeout scenarios
 * 
 * 4. Error Handling
 *    - Don't expose internal errors to clients
 *    - Log errors for debugging
 *    - Return standardized error responses
 */

/**
 * WORKFLOW EXAMPLE: Complete Request Flow
 * ============================================
 */

const completeWorkflow = `
Step 1: User Authentication (Identity Service)
─────────────────────────────────────────────
Client → POST /api/v1/auth/login
        { email, password }
         ↓
Identity Service → Verify credentials
                → Generate tokens
                ← Return tokens

Response: { accessToken, refreshToken, user }


Step 2: Create IT Request (IT Service)
─────────────────────────────────────
Client → POST /api/v1/requests/create
        Headers: { Authorization: Bearer <token> }
        { requestType, description }
         ↓
IT Service → Verify token with Identity Service
          → Save request to IT database
          → Call Notification Service
           ↓
Response: { requestId, status }


Step 3: Notify User (Notification Service)
──────────────────────────────────────────
IT Service → POST /api/v1/notifications/send
           { userId, message, type }
            ↓
Notification Service → Get user email from Identity Service
                    → Save notification record
                    → Send email
                    ↓
Response: { notificationId }


Step 4: Get Request Status (Facility Service)
──────────────────────────────────────────
Client → GET /api/v1/requests/:id
        Headers: { Authorization: Bearer <token> }
         ↓
Facility Service → Verify token
               → Fetch from Facility database
               → Get user details from Identity Service
               ↓
Response: { requestId, userDetails, status }
`;

module.exports = {
    itServiceTokenVerification,
    facilityServiceGetUser,
    notificationServiceExample,
    standardResponseContract,
    completeWorkflow,
};
