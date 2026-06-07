/**
 * Quick API Testing Guide
 * Identity Service - Smart Campus System
 * 
 * Copy and paste these curl commands to test the API
 * Or use them in Postman
 */

/**
 * ============================================
 * 1. HEALTH CHECK
 * ============================================
 */

// Check if service is running
curl -X GET http://localhost:5000/api/v1/health

/**
 * Expected Response (200 OK):
 * {
 *   "status": "UP",
 *   "service": "Identity Service",
 *   "timestamp": "2024-06-01T12:00:00Z",
 *   "uptime": 123.456
 * }
 */

/**
 * ============================================
 * 2. AUTHENTICATION - REGISTER NEW USER
 * ============================================
 */

curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "matricNumber": "AD123456",
    "role": "student"
  }'

/**
 * Expected Response (201 Created):
 * {
 *   "success": true,
 *   "status": 201,
 *   "message": "User registered successfully",
 *   "data": {
 *     "user": {
 *       "id": "...",
 *       "name": "John Doe",
 *       "email": "john@example.com",
 *       "matricNumber": "AD123456",
 *       "role": "student",
 *       "createdAt": "2024-06-01T..."
 *     },
 *     "accessToken": "eyJhbGciOiJIUzI1NiIs...",
 *     "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
 *   }
 * }
 */

/**
 * ============================================
 * 3. AUTHENTICATION - LOGIN
 * ============================================
 */

curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

/**
 * Expected Response (200 OK):
 * {
 *   "success": true,
 *   "status": 200,
 *   "message": "Login successful",
 *   "data": {
 *     "user": { ... },
 *     "accessToken": "...",
 *     "refreshToken": "..."
 *   }
 * }
 * 
 * SAVE THE accessToken - you'll need it for protected endpoints!
 */

/**
 * ============================================
 * 4. GET USER PROFILE (Requires Token)
 * ============================================
 */

curl -X GET http://localhost:5000/api/v1/users/profile/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"

/**
 * Expected Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Profile retrieved successfully",
 *   "data": {
 *     "id": "...",
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "role": "student",
 *     "createdAt": "2024-06-01T..."
 *   }
 * }
 */

/**
 * ============================================
 * 5. REFRESH TOKEN
 * ============================================
 */

curl -X POST http://localhost:5000/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'

/**
 * Expected Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Token refreshed successfully",
 *   "data": {
 *     "accessToken": "NEW_ACCESS_TOKEN_HERE"
 *   }
 * }
 */

/**
 * ============================================
 * 6. CHANGE PASSWORD (Requires Token)
 * ============================================
 */

curl -X POST http://localhost:5000/api/v1/users/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "SecurePass123",
    "newPassword": "NewSecurePass123",
    "confirmPassword": "NewSecurePass123"
  }'

/**
 * Expected Response (200 OK):
 * {
 *   "success": true,
 *   "data": { "message": "Password changed successfully" }
 * }
 */

/**
 * ============================================
 * 7. CREATE ADMIN USER (for testing)
 * ============================================
 */

curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "AdminPass123",
    "confirmPassword": "AdminPass123",
    "role": "admin"
  }'

/**
 * ============================================
 * 8. GET ALL USERS (Admin Only - Requires Admin Token)
 * ============================================
 */

curl -X GET http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN_HERE"

/**
 * Expected Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "count": 2,
 *     "users": [
 *       { user object 1 },
 *       { user object 2 }
 *     ]
 *   }
 * }
 */

/**
 * ============================================
 * 9. GET USER BY ID (Admin Only)
 * ============================================
 */

curl -X GET http://localhost:5000/api/v1/users/USER_ID_HERE \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN_HERE"

/**
 * ============================================
 * 10. UPDATE USER (Requires Token)
 * ============================================
 */

curl -X PUT http://localhost:5000/api/v1/users/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "matricNumber": "AD654321"
  }'

/**
 * ============================================
 * 11. DELETE USER (Admin Only)
 * ============================================
 */

curl -X DELETE http://localhost:5000/api/v1/users/USER_ID_HERE \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN_HERE"

/**
 * ============================================
 * 12. LOGOUT
 * ============================================
 */

curl -X POST http://localhost:5000/api/v1/auth/logout

/**
 * Expected Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Logout successful"
 * }
 */

/**
 * ============================================
 * ERROR EXAMPLES
 * ============================================
 */

// Missing token
// Response (401 Unauthorized):
// {
//   "success": false,
//   "status": 401,
//   "message": "Unauthorized - Token required"
// }

// Invalid credentials
// Response (401 Unauthorized):
// {
//   "success": false,
//   "status": 401,
//   "message": "Invalid email or password"
// }

// Email already exists
// Response (409 Conflict):
// {
//   "success": false,
//   "status": 409,
//   "message": "User already exists with this email"
// }

// Access denied (not admin)
// Response (403 Forbidden):
// {
//   "success": false,
//   "status": 403,
//   "message": "Forbidden - Insufficient permissions"
// }

/**
 * ============================================
 * POSTMAN SETUP
 * ============================================
 * 
 * 1. Create a new collection: "Smart Campus - Identity Service"
 * 
 * 2. Set collection-level variable:
 *    Variable: {{token}}
 *    Value: (leave empty, will be filled after login)
 * 
 * 3. Create requests using the examples above
 * 
 * 4. After login, copy the accessToken value
 * 
 * 5. In protected endpoints, use:
 *    Authorization header: Bearer {{token}}
 * 
 * 6. Or use Postman pre-request scripts to auto-extract tokens:
 *    - In login request Tests tab:
 *    pm.environment.set("token", pm.response.json().data.accessToken);
 */

/**
 * ============================================
 * TESTING WORKFLOW
 * ============================================
 * 
 * 1. Check health: GET /health
 * 2. Register user: POST /auth/register
 * 3. Login: POST /auth/login (save token)
 * 4. Get profile: GET /users/profile/me (use token)
 * 5. Refresh token: POST /auth/refresh-token
 * 6. Change password: POST /users/change-password
 * 7. Logout: POST /auth/logout
 * 
 * For Admin Testing:
 * 1. Register admin user with role="admin"
 * 2. Login as admin (save admin token)
 * 3. Get all users: GET /users (use admin token)
 * 4. Get specific user: GET /users/:id
 * 5. Update user: PUT /users/:id
 * 6. Delete user: DELETE /users/:id
 */
